#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { parseArgv, validateCommand } from "./parser.js";
import { resolvePresentationTokens } from "./presentation.js";
import { renderAlert } from "./render.js";
import { summarizeRunResult } from "./result-summary.js";
import { getExitCode, runCommand } from "./run.js";
import { detectTerminalCapabilities } from "./terminal.js";

const HELP_TEXT = `Usage:
  flareup [<status>] [<message>] [flags]
  flareup run [--success <msg>] [--error <msg>] [--no-success] [--no-error] [flags] -- <command...>

Statuses:
  success, error, warn, info, debug

Flags:
  --style <name>  box | banner | callout | line | minimal | panel
  --bell
  --no-color
  --help
  --version`;

async function readPackageVersion(): Promise<string> {
  const packageJsonPath = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as { version: string };

  return packageJson.version;
}

function writeOutput(output: string, bell: boolean): void {
  const suffix = bell ? "\u0007" : "";

  process.stdout.write(`${output}\n${suffix}`);
}

async function main(): Promise<void> {
  const command = validateCommand(parseArgv(process.argv.slice(2)));

  if (command.kind === "help") {
    process.stdout.write(`${HELP_TEXT}\n`);
    return;
  }

  if (command.kind === "version") {
    process.stdout.write(`${await readPackageVersion()}\n`);
    return;
  }

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

      writeOutput(output, command.bell);
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

  writeOutput(output, command.bell);
}

void main();
