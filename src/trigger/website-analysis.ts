import "server-only";

import {
  AbortTaskRunError,
  idempotencyKeys,
  logger,
  task,
} from "@trigger.dev/sdk";
import { z } from "zod";

import { UnsafeUrlError } from "@/lib/services/safe-web-url";
import { analyzeWebsite } from "@/lib/services/website-analyzer";
import {
  calculateWebsiteStatus,
  mapAuditResultToProspectStatus,
} from "@/lib/domain/website-audit";

import { selectProspectsForAnalysis } from "./task-domain";
import {
  getAuthorizedOwnerContext,
  getAuthorizedTaskContext,
  ownedTaskPayloadSchema,
} from "./task-support";

const websitePayloadSchema = z.object({
  prospectId: z.string().uuid(),
  ownerId: z.string().uuid(),
  force: z.boolean().default(false),
});

export const analyzeProspectWebsite = task({
  id: "analyze-prospect-website",
  queue: {
    name: "website-analysis",
    concurrencyLimit: Math.min(
      2,
      Math.max(1, Number(process.env.WEBSITE_AUDIT_CONCURRENCY ?? 2)),
    ),
  },
  maxDuration: 150,
  retry: { maxAttempts: 2 },
  run: async (input: unknown, { signal, ctx }) => {
    const payload = websitePayloadSchema.safeParse(input);
    if (!payload.success) throw new AbortTaskRunError("Payload inválido.");
    const { client } = await getAuthorizedOwnerContext(payload.data.ownerId);
    signal.throwIfAborted();
    const { data: prospect, error } = await client
      .from("prospects")
      .select("id,website_url")
      .eq("id", payload.data.prospectId)
      .eq("owner_id", payload.data.ownerId)
      .single();
    if (error || !prospect)
      throw new AbortTaskRunError("Prospecto no autorizado.");
    if (!prospect.website_url) return { status: "omitido-sin-sitio" as const };

    const recentSince = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1_000,
    ).toISOString();
    if (!payload.data.force) {
      const { count } = await client
        .from("website_audits")
        .select("id", { count: "exact", head: true })
        .eq("prospect_id", prospect.id)
        .eq("owner_id", payload.data.ownerId)
        .eq("status", "completada")
        .gte("analyzed_at", recentSince);
      if ((count ?? 0) > 0) return { status: "omitido-reciente" as const };
    }

    const { data: activeAudit } = await client
      .from("website_audits")
      .select("id")
      .eq("prospect_id", prospect.id)
      .eq("owner_id", payload.data.ownerId)
      .in("status", ["pendiente", "analizando"])
      .maybeSingle();
    if (activeAudit)
      return { status: "omitido-activo" as const, auditId: activeAudit.id };

    const { data: audit, error: insertError } = await client
      .from("website_audits")
      .insert({
        owner_id: payload.data.ownerId,
        prospect_id: prospect.id,
        status: "pendiente",
        progress: 10,
        external_run_id: ctx.run.id,
        initial_url: prospect.website_url,
        final_url: prospect.website_url,
        facts: { source: "trigger-playwright", runId: ctx.run.id },
      })
      .select("id")
      .single();
    if (insertError || !audit)
      throw new Error("No se pudo preparar la auditoría.");

    try {
      await client
        .from("website_audits")
        .update({ status: "analizando", progress: 25 })
        .eq("id", audit.id);
      const analysis = await analyzeWebsite(prospect.website_url, {
        signal,
        timeoutMs: Number(process.env.WEBSITE_AUDIT_TIMEOUT_MS ?? 30_000),
      });
      const basePath = `owners/${payload.data.ownerId}/prospects/${prospect.id}/audits/${audit.id}`;
      const upload = async (path: string, contents: Buffer | null) => {
        if (!contents) return null;
        const { error: uploadError } = await client.storage
          .from("website-audits")
          .upload(path, contents, { contentType: "image/png", upsert: false });
        return uploadError ? null : path;
      };
      const desktopPath = await upload(
        `${basePath}.png`,
        analysis.desktopScreenshot,
      );
      const mobilePath = await upload(
        `${basePath}.mobile.png`,
        analysis.mobileScreenshot,
      );

      const { data: exclusions } = await client
        .from("exclusion_list")
        .select("contact_type,normalized_value")
        .eq("owner_id", payload.data.ownerId);
      const excluded = new Set(
        (exclusions ?? []).map(
          (item) => `${item.contact_type}:${item.normalized_value}`,
        ),
      );
      const contacts = analysis.facts.contacts.filter(
        (contact) =>
          !excluded.has(`${contact.type}:${contact.normalizedValue}`),
      );
      if (contacts.length > 0) {
        const { error: contactError } = await client
          .from("contact_points")
          .upsert(
            contacts.map((contact) => ({
              owner_id: payload.data.ownerId,
              prospect_id: prospect.id,
              type: contact.type,
              value: contact.value,
              normalized_value: contact.normalizedValue,
              source_url: contact.sourceUrl,
              source_type: "official_website",
              is_public: true,
              confidence: 1,
              verification_status: "verificado",
              last_verified_at: new Date().toISOString(),
            })),
            {
              onConflict: "prospect_id,type,normalized_value",
              ignoreDuplicates: true,
            },
          );
        if (contactError)
          logger.warn("Los contactos observados no pudieron persistirse", {
            prospectId: prospect.id,
            auditId: audit.id,
          });
      }

      const copyrightYear =
        analysis.facts.copyright?.match(/\b(19|20)\d{2}\b/)?.[0];
      const classification = calculateWebsiteStatus({
        hasWebsite: true,
        reachable: analysis.facts.websiteReachable,
        usesHttps: analysis.finalUrl.startsWith("https:"),
        hasMobileViewport: analysis.facts.hasMobileViewport,
        hasMetaDescription: analysis.facts.hasMetaDescription,
        hasContactMethod: analysis.facts.contacts.length > 0,
        hasBooking: analysis.facts.hasBooking,
        hasServicesContent: analysis.facts.hasServicesContent,
        brokenLinksCount: analysis.brokenLinksCount,
        copyrightYear: copyrightYear ? Number(copyrightYear) : null,
      });
      const { error: updateError } = await client
        .from("website_audits")
        .update({
          status: "completada",
          progress: 100,
          result_status: classification.result,
          final_url: analysis.finalUrl,
          http_status: analysis.httpStatus,
          uses_https: analysis.finalUrl.startsWith("https:"),
          has_viewport: analysis.facts.hasMobileViewport,
          has_mobile_viewport: analysis.facts.hasMobileViewport,
          has_contact_form: analysis.facts.hasContactForm,
          has_whatsapp: analysis.facts.hasWhatsapp,
          has_booking: analysis.facts.hasBooking,
          has_social_links: analysis.facts.socialLinks.length > 0,
          has_services_content: analysis.facts.hasServicesContent,
          has_meta_description: analysis.facts.hasMetaDescription,
          title: analysis.facts.title,
          meta_description: analysis.facts.metaDescription,
          copyright_year: copyrightYear ? Number(copyrightYear) : null,
          broken_links_count: analysis.brokenLinksCount,
          screenshot_path: desktopPath,
          facts: {
            ...analysis.facts,
            initialUrl: analysis.initialUrl,
            mobileScreenshotPath: mobilePath,
            warnings: classification.warnings,
          },
          analyzed_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", audit.id);
      if (updateError) throw new Error("No se pudo guardar la auditoría.");
      await client
        .from("prospects")
        .update({
          website_url: analysis.finalUrl,
          website_url_source: "official_website",
          website_url_verified_at: new Date().toISOString(),
          website_status: mapAuditResultToProspectStatus(classification.result),
        })
        .eq("id", prospect.id)
        .eq("owner_id", payload.data.ownerId);
      logger.info("Auditoría web completada", {
        prospectId: prospect.id,
        auditId: audit.id,
        contacts: contacts.length,
        brokenLinks: analysis.brokenLinksCount,
      });
      return { status: "completada" as const, auditId: audit.id };
    } catch (error) {
      await client
        .from("website_audits")
        .update({
          status: "fallida",
          progress: 100,
          result_status: "unreachable",
          error_message:
            error instanceof UnsafeUrlError
              ? error.message
              : "No se pudo analizar el sitio de forma segura.",
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", audit.id);
      if (error instanceof UnsafeUrlError)
        throw new AbortTaskRunError(error.message);
      throw error;
    }
  },
});

export const analyzeSearchWebsites = task({
  id: "analyze-search-websites",
  maxDuration: 300,
  retry: { maxAttempts: 2 },
  run: async (input: unknown, { signal, ctx }) => {
    const payload = ownedTaskPayloadSchema
      .extend({ force: z.boolean().default(false) })
      .safeParse(input);
    if (!payload.success) throw new AbortTaskRunError("Payload inválido.");
    const { client } = await getAuthorizedTaskContext(payload.data);
    signal.throwIfAborted();
    const { data: prospects, error } = await client
      .from("prospects")
      .select("id,website_url")
      .eq("search_id", payload.data.searchId)
      .eq("owner_id", payload.data.ownerId);
    if (error) throw new Error("No se pudieron cargar los prospectos.");
    const withWebsite = prospects.filter((prospect) => prospect.website_url);
    if (withWebsite.length === 0)
      return { launched: 0, failed: 0, skipped: prospects.length };
    const recentSince = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1_000,
    ).toISOString();
    const { data: recentAudits } = await client
      .from("website_audits")
      .select("prospect_id")
      .eq("owner_id", payload.data.ownerId)
      .eq("status", "completada")
      .gte("analyzed_at", recentSince)
      .in(
        "prospect_id",
        withWebsite.map((prospect) => prospect.id),
      );
    const eligible = selectProspectsForAnalysis(
      withWebsite,
      new Set((recentAudits ?? []).map((audit) => audit.prospect_id)),
      payload.data.force,
    );
    const items = await Promise.all(
      eligible.map(async (prospect) => ({
        payload: {
          prospectId: prospect.id,
          ownerId: payload.data.ownerId,
          force: payload.data.force,
        },
        options: {
          idempotencyKey: await idempotencyKeys.create(
            `website:${prospect.id}:${ctx.run.id}`,
            { scope: "global" },
          ),
          idempotencyKeyTTL: "1d" as const,
        },
      })),
    );
    signal.throwIfAborted();
    const batch = await analyzeProspectWebsite.batchTriggerAndWait(items);
    const failed = batch.runs.filter((run) => !run.ok).length;
    logger.info("Lote de auditorías completado", {
      searchId: payload.data.searchId,
      launched: items.length,
      failed,
      skipped: prospects.length - items.length,
    });
    return {
      launched: items.length,
      failed,
      skipped: prospects.length - items.length,
    };
  },
});
