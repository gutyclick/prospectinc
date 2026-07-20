import { describe, expect, it } from "vitest";

import {
  isBlockedAddress,
  UnsafeUrlError,
  validatePublicUrl,
} from "./safe-web-url";

describe("protección SSRF", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "192.168.1.2",
    "::1",
    "fc00::1",
    "224.0.0.1",
  ])("bloquea la dirección %s", (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each([
    "file:///etc/passwd",
    "data:text/html,test",
    "ftp://example.com/file",
  ])("bloquea el protocolo de %s", async (url) => {
    await expect(validatePublicUrl(url)).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("bloquea localhost y metadatos internos", async () => {
    await expect(
      validatePublicUrl("http://localhost/admin"),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
    await expect(
      validatePublicUrl("http://169.254.169.254/latest/meta-data"),
    ).rejects.toBeInstanceOf(UnsafeUrlError);
  });
});
