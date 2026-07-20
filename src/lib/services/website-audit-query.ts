import "server-only";

import { requireOwner } from "@/lib/auth/require-owner";
import { createClient } from "@/lib/supabase/server";
import type { WebsiteAuditResult } from "@/lib/domain/website-audit";

export type WebsiteAuditView = {
  id: string;
  prospectId: string;
  status: string;
  progress: number;
  resultStatus: WebsiteAuditResult | null;
  analyzedAt: string | null;
  errorMessage: string | null;
  facts: Record<string, unknown>;
  warnings: string[];
  screenshotUrl: string | null;
  contacts: Array<{ type: string; value: string; sourceUrl: string }>;
};

export async function getLatestWebsiteAudits(
  prospectIds: string[],
): Promise<Record<string, WebsiteAuditView>> {
  if (prospectIds.length === 0) return {};
  const [client, owner] = await Promise.all([createClient(), requireOwner()]);
  const [{ data: audits }, { data: contacts }] = await Promise.all([
    client
      .from("website_audits")
      .select(
        "id,prospect_id,status,progress,result_status,analyzed_at,error_message,facts,screenshot_path,created_at",
      )
      .eq("owner_id", owner.id)
      .in("prospect_id", prospectIds)
      .order("created_at", { ascending: false }),
    client
      .from("contact_points")
      .select("prospect_id,type,value,source_url")
      .eq("owner_id", owner.id)
      .eq("source_type", "official_website")
      .in("prospect_id", prospectIds),
  ]);
  const result: Record<string, WebsiteAuditView> = {};
  for (const audit of audits ?? []) {
    if (result[audit.prospect_id]) continue;
    const facts =
      audit.facts &&
      typeof audit.facts === "object" &&
      !Array.isArray(audit.facts)
        ? (audit.facts as Record<string, unknown>)
        : {};
    let screenshotUrl: string | null = null;
    if (audit.screenshot_path) {
      const { data } = await client.storage
        .from("website-audits")
        .createSignedUrl(audit.screenshot_path, 300);
      screenshotUrl = data?.signedUrl ?? null;
    }
    result[audit.prospect_id] = {
      id: audit.id,
      prospectId: audit.prospect_id,
      status: audit.status,
      progress: audit.progress,
      resultStatus: audit.result_status as WebsiteAuditResult | null,
      analyzedAt: audit.analyzed_at,
      errorMessage: audit.error_message,
      facts,
      warnings: Array.isArray(facts.warnings)
        ? facts.warnings.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      screenshotUrl,
      contacts: (contacts ?? [])
        .filter((item) => item.prospect_id === audit.prospect_id)
        .map((item) => ({
          type: item.type,
          value: item.value,
          sourceUrl: item.source_url,
        })),
    };
  }
  return result;
}
