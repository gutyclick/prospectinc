import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const isWindows = process.platform === "win32";
const target = process.argv.includes("--linked") ? "--linked" : "--local";
const executable = isWindows ? (process.env.ComSpec ?? "cmd.exe") : "supabase";
const args = isWindows
  ? ["/d", "/s", "/c", `supabase.CMD gen types typescript ${target}`]
  : ["gen", "types", "typescript", target];

const result = spawnSync(executable, args, {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (result.stderr) process.stderr.write(result.stderr);
if (result.status === 0 && result.stdout) {
  writeFileSync(
    join(process.cwd(), "src/types/database.types.ts"),
    result.stdout,
    "utf8",
  );
} else {
  process.exitCode = result.status ?? 1;
}
