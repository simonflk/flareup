import type { AlertCliCommand, AlertLevel } from "./types.js";

const ALERT_LEVELS = new Set<Exclude<AlertLevel, "plain">>([
  "success",
  "error",
  "warn",
  "info",
  "debug",
]);

function isAlertLevel(value: string): value is Exclude<AlertLevel, "plain"> {
  return ALERT_LEVELS.has(value as Exclude<AlertLevel, "plain">);
}

export function parseArgv(argv: string[]): AlertCliCommand {
  const positionals: string[] = [];
  let noColor = false;

  for (const argument of argv) {
    if (argument === "--no-color") {
      noColor = true;
      continue;
    }

    if (argument.startsWith("--")) {
      throw new Error(`Unknown flag: ${argument}`);
    }

    positionals.push(argument);
  }

  if (positionals.length > 2) {
    throw new Error(`Unexpected argument: ${positionals[2]}`);
  }

  if (positionals.length === 2) {
    const [level, message] = positionals;

    if (!isAlertLevel(level)) {
      throw new Error(`Unknown status: ${level}`);
    }

    return {
      kind: "direct",
      level,
      style: "box",
      message,
      noColor,
      bell: false,
    };
  }

  const [message] = positionals;

  if (message && isAlertLevel(message)) {
    return {
      kind: "direct",
      level: message,
      style: "box",
      noColor,
      bell: false,
    };
  }

  return {
    kind: "direct",
    level: "plain",
    style: "box",
    message,
    noColor,
    bell: false,
  };
}

export function validateCommand(command: AlertCliCommand): AlertCliCommand & { message: string } {
  if (!command.message || command.message.length === 0) {
    throw new Error("A message is required.");
  }

  return command as AlertCliCommand & { message: string };
}
