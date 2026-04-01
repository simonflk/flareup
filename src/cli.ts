#!/usr/bin/env node

import { parseArgv, validateCommand } from "./parser.js";
import { resolvePresentationTokens } from "./presentation.js";
import { renderAlert } from "./render.js";
import { detectTerminalCapabilities } from "./terminal.js";

function main(): void {
  const command = validateCommand(parseArgv(process.argv.slice(2)));
  const terminal = detectTerminalCapabilities({ noColor: command.noColor });
  const tokens = resolvePresentationTokens(command.level, terminal);
  const output = renderAlert({
    style: command.style,
    message: command.message,
    width: terminal.width,
    truncateMarker: terminal.unicode ? "…" : "...",
    tokens,
  });

  process.stdout.write(`${output}\n`);
}

main();
