import "server-only";

import { sameRegistrableHost, validatePublicUrl } from "./safe-web-url";

const MAX_HTML_BYTES = 2_000_000;
const MAX_REDIRECTS = 5;

export type SafeHtmlResponse = {
  initialUrl: string;
  finalUrl: string;
  status: number;
  html: string;
  contentType: string;
};

export async function safeFetchHtml(
  input: string,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<SafeHtmlResponse> {
  const initial = await validatePublicUrl(input);
  let current = initial;
  const timeout = AbortSignal.timeout(options.timeoutMs ?? 15_000);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeout])
    : timeout;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    await validatePublicUrl(current.href);
    const response = await fetch(current, {
      redirect: "manual",
      signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "ProspectorAI-Auditor/1.0",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirects === MAX_REDIRECTS)
        throw new Error("El sitio excedió el límite de redirecciones.");
      const location = response.headers.get("location");
      if (!location)
        throw new Error("El sitio devolvió una redirección inválida.");
      current = await validatePublicUrl(new URL(location, current).href);
      continue;
    }
    const contentType = response.headers.get("content-type") ?? "";
    const declaredSize = Number(response.headers.get("content-length") ?? 0);
    if (declaredSize > MAX_HTML_BYTES)
      throw new Error("La página excede el tamaño permitido.");
    if (!contentType.toLowerCase().includes("text/html"))
      throw new Error("La URL no devolvió HTML.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_HTML_BYTES)
      throw new Error("La página excede el tamaño permitido.");
    return {
      initialUrl: initial.href,
      finalUrl: current.href,
      status: response.status,
      html: new TextDecoder().decode(bytes),
      contentType,
    };
  }
  throw new Error("No se pudo completar la navegación segura.");
}

export async function countBrokenInternalLinks(
  html: string,
  pageUrl: string,
  signal?: AbortSignal,
) {
  const base = new URL(pageUrl);
  const candidates = [...html.matchAll(/href=["']([^"'#]+)["']/gi)]
    .map((match) => {
      try {
        return new URL(match[1], base);
      } catch {
        return null;
      }
    })
    .filter((url): url is URL =>
      Boolean(
        url &&
        sameRegistrableHost(url, base) &&
        ["http:", "https:"].includes(url.protocol),
      ),
    )
    .filter(
      (url, index, all) =>
        all.findIndex((item) => item.href === url.href) === index,
    )
    .slice(0, 10);
  const checks = await Promise.allSettled(
    candidates.map(async (url) => {
      await validatePublicUrl(url.href);
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(5_000)])
          : AbortSignal.timeout(5_000),
      });
      return response.status >= 400;
    }),
  );
  return checks.filter(
    (result) => result.status === "fulfilled" && result.value,
  ).length;
}
