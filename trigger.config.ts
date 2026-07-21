import { defineConfig } from "@trigger.dev/sdk";
import { playwright } from "@trigger.dev/build/extensions/playwright";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_configure_me",
  dirs: ["./src/trigger"],
  maxDuration: 300,
  build: {
    extensions: [playwright({ browsers: ["chromium"], headless: true })],
  },
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 10_000,
      factor: 2,
      randomize: true,
    },
  },
});
