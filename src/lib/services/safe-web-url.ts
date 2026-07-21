import "server-only";

import { isIP } from "node:net";
import { resolve4, resolve6 } from "node:dns/promises";

const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain"]);

export class UnsafeUrlError extends Error {
  constructor(message = "La URL apunta a una red no permitida.") {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

function blockedIpv4(address: string) {
  const parts = address.split(".").map(Number);
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51) ||
    (a === 203 && b === 0) ||
    a >= 224
  );
}

function blockedIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:db8:")
  )
    return true;
  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mapped ? blockedIpv4(mapped) : false;
}

export function isBlockedAddress(address: string) {
  const version = isIP(address);
  return version === 4
    ? blockedIpv4(address)
    : version === 6
      ? blockedIpv6(address)
      : true;
}

export async function validatePublicUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new UnsafeUrlError("La URL del sitio no es válida.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new UnsafeUrlError("Solo se permiten sitios HTTP o HTTPS.");
  url.username = "";
  url.password = "";
  url.hash = "";
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    !hostname ||
    BLOCKED_HOSTS.has(hostname) ||
    hostname.endsWith(".localhost")
  )
    throw new UnsafeUrlError();

  const literalVersion = isIP(hostname);
  const addresses = literalVersion
    ? [hostname]
    : [
        ...(await resolve4(hostname).catch(() => [])),
        ...(await resolve6(hostname).catch(() => [])),
      ];
  if (addresses.length === 0)
    throw new UnsafeUrlError("El dominio no pudo resolverse.");
  if (addresses.some(isBlockedAddress)) throw new UnsafeUrlError();
  return url;
}

export function sameRegistrableHost(candidate: URL, origin: URL) {
  return (
    candidate.hostname === origin.hostname ||
    candidate.hostname.endsWith(`.${origin.hostname}`)
  );
}
