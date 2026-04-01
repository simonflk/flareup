#!/usr/bin/env node

import { parseArgv, validateCommand } from "./parser.js";
import { resolvePresentationTokens } from "./presentation.js";
import { renderAlert } from "./render.js";
import { summarizeRunResult } from "./result-summary.js";
import { getExitCode, runCommand } from "./run.js";
import { detectTerminalCapabilities } from "./terminal.js";

async function main(): Promise<void> {
  const command = validateCommand(parseArgv(process.argv.slice(2)));
  const terminal = detectTerminalCapabilities({ noColor: command.noColor });

  if (command.kind === "run") {
    const result = await runCommand(command.command);
    const summary = summarizeRunResult(result, {
      successMessage: command.successMessage,
      errorMessage: command.errorMessage,
      showSuccess: command.showSuccess,
      showError: command.showError,
    });

    if (summary !== null) {
      const tokens = resolvePresentationTokens(summary.level, terminal);
      const output = renderAlert({
        style: command.style,
        lines: summary.lines,
        width: terminal.width,
        truncateMarker: terminal.unicode ? "…" : "...",
        tokens,
      });

      process.stdout.write(`${output}\n`);
    }

    process.exitCode = getExitCode(result);
    return;
  }

  const tokens = resolvePresentationTokens(command.level, terminal);
  const output = renderAlert({
    style: command.style,
    lines: [{ text: command.message!, variant: "primary" }],
    width: terminal.width,
    truncateMarker: terminal.unicode ? "…" : "...",
    tokens,
  });

  process.stdout.write(`${output}\n`);
}

void main();
