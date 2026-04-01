import test from "node:test";
import assert from "node:assert/strict";

import { summarizeRunResult } from "../.test-dist/result-summary.js";

test("summarizeRunResult maps successful runs to a success alert", () => {
  const summary = summarizeRunResult({
    command: ["npm", "test"],
    durationMs: 4200,
    exitCode: 0,
    signal: null,
  });

  assert.deepEqual(summary, {
    level: "success",
    lines: [
      { text: "Command succeeded (4.2s)", variant: "primary" },
      { text: "npm test", variant: "secondary" },
    ],
  });
});

test("summarizeRunResult maps failed runs to an error alert", () => {
  const summary = summarizeRunResult({
    command: ["npm", "test"],
    durationMs: 4200,
    exitCode: 1,
    signal: null,
  });

  assert.deepEqual(summary, {
    level: "error",
    lines: [
      { text: "Command failed (exit 1, 4.2s)", variant: "primary" },
      { text: "npm test", variant: "secondary" },
    ],
  });
});

test("summarizeRunResult suppresses output when the command ended via signal", () => {
  assert.equal(
    summarizeRunResult({
      command: ["npm", "test"],
      durationMs: 100,
      exitCode: null,
      signal: "SIGINT",
    }),
    null,
  );
});
