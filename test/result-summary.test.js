import test from "node:test";
import assert from "node:assert/strict";

import { summarizeRunResult } from "../.test-dist/result-summary.js";

test("summarizeRunResult maps successful runs to a success alert", () => {
  const summary = summarizeRunResult(
    {
      command: ["npm", "test"],
      durationMs: 4200,
      exitCode: 0,
      signal: null,
    },
    {
      showSuccess: true,
      showError: true,
    },
  );

  assert.deepEqual(summary, {
    level: "success",
    lines: [
      { text: "Command succeeded (4.2s)", variant: "primary" },
      { text: "npm test", variant: "secondary" },
    ],
  });
});

test("summarizeRunResult maps failed runs to an error alert", () => {
  const summary = summarizeRunResult(
    {
      command: ["npm", "test"],
      durationMs: 4200,
      exitCode: 1,
      signal: null,
    },
    {
      showSuccess: true,
      showError: true,
    },
  );

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
    summarizeRunResult(
      {
        command: ["npm", "test"],
        durationMs: 100,
        exitCode: null,
        signal: "SIGINT",
      },
      {
        showSuccess: true,
        showError: true,
      },
    ),
    null,
  );
});

test("summarizeRunResult applies custom messages and suppression flags", () => {
  assert.deepEqual(
    summarizeRunResult(
      {
        command: ["npm", "test"],
        durationMs: 4200,
        exitCode: 0,
        signal: null,
      },
      {
        successMessage: "yay",
        showSuccess: true,
        showError: true,
      },
    ),
    {
      level: "success",
      lines: [
        { text: "yay", variant: "primary" },
        { text: "npm test", variant: "secondary" },
      ],
    },
  );

  assert.equal(
    summarizeRunResult(
      {
        command: ["npm", "test"],
        durationMs: 4200,
        exitCode: 0,
        signal: null,
      },
      {
        showSuccess: false,
        showError: true,
      },
    ),
    null,
  );

  assert.equal(
    summarizeRunResult(
      {
        command: ["npm", "test"],
        durationMs: 4200,
        exitCode: 1,
        signal: null,
      },
      {
        showSuccess: true,
        showError: false,
      },
    ),
    null,
  );
});
