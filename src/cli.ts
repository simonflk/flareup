#!/usr/bin/env node

import { readFile } from "node:fs/promises";

import { alert, run } from "./index.js";
import { parseArgv, validateCommand } from "./parser.js";

const HELP_TEXT = `Usage:
  flareup [<status>] [<message>] [flags]
  flareup run [--success <msg>] [--error <msg>] [--no-success] [--no-error] [flags] -- <command...>

Statuses:
  success, error, warn, info, debug

Flags:
  --style <name>  box | banner | callout | line | minimal | panel
  --notify        Trigger terminal attention (OSC 9 / OSC 777 / BEL)
  --bell          Play a terminal bell character
  --no-color
  --help
  --version`;

async function readPackageVersion(): Promise<string> {
  const packageJsonPath = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as { version: string };

  return packageJson.version;
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

  if (command.kind === "run") {
    const result = await run(command.command, {
      success: command.successMessage,
      error: command.errorMessage,
      noSuccess: !command.showSuccess,
      noError: !command.showError,
      style: command.style,
      bell: command.bell,
      notify: command.notify,
      noColor: command.noColor,
    });

    process.exitCode = result.exitCode;
    return;
  }

  alert(command.message!, {
    level: command.level,
    style: command.style,
    bell: command.bell,
    notify: command.notify,
    noColor: command.noColor,
  });
}

void main();
