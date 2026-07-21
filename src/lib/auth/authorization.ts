export const PUBLIC_PATHS = [
  "/login",
  "/auth/confirm",
  "/actualizar-contrasena",
] as const;

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? null;
}

export function isOwnerEmail(
  email: string | null | undefined,
  ownerEmail: string | null | undefined,
) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOwner = normalizeEmail(ownerEmail);
  return Boolean(normalizedEmail && normalizedOwner === normalizedEmail);
}

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function getAuthRedirectPath({
  pathname,
  authenticated,
  authorized,
}: {
  pathname: string;
  authenticated: boolean;
  authorized: boolean;
}) {
  const publicPath = isPublicPath(pathname);

  if (pathname === "/login" && authenticated && authorized) return "/";
  if (!publicPath && (!authenticated || !authorized)) return "/login";
  return null;
}
