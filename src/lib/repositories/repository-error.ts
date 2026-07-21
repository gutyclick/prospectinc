export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code:
      "not-found" | "conflict" | "validation" | "unavailable" = "unavailable",
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export function mapProviderError(
  error: { code?: string; message: string },
  fallback: string,
) {
  if (error.code === "23505")
    return new RepositoryError("El registro ya existe.", "conflict");
  if (error.code === "23503")
    return new RepositoryError(
      "La relación indicada no es válida.",
      "validation",
    );
  return new RepositoryError(fallback);
}
