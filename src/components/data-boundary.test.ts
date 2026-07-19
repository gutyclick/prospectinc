import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.tsx?$/.test(entry.name)
        ? [path]
        : [];
  });
}

describe("frontera de datos", () => {
  it("impide consultas Supabase dentro de componentes visuales", () => {
    const files = sourceFiles(join(process.cwd(), "src/components"));
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/\.from\s*\(\s*["'`]/);
      expect(source, file).not.toMatch(/create(?:Browser|Server)Client/);
    }
  });
});
