import type { AlertCliCommand, AlertLevel } from "./types.js";

const ALERT_LEVELS = new Set<Exclude<AlertLevel, "plain">>([
  "success",
  "error",
  "warn",
  "info",
  "debug",
]);
const ALERT_STYLES = new Set(["box", "banner", "callout", "line", "minimal", "panel"]);

function isAlertLevel(value: string): value is Exclude<AlertLevel, "plain"> {
  return ALERT_LEVELS.has(value as Exclude<AlertLevel, "plain">);
}

function isAlertStyle(value: string): value is AlertCliCommand["style"] {
  return ALERT_STYLES.has(value as AlertCliCommand["style"]);
}

export function parseArgv(argv: string[]): AlertCliCommand {
  const positionals: string[] = [];
  let noColor = false;
  let style: AlertCliCommand["style"] = "box";

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--no-color") {
      noColor = true;
      continue;
    }

    if (argument === "--style") {
      const styleName = argv[index + 1];

      if (!styleName) {
        throw new Error("Missing value for --style");
      }

      if (!isAlertStyle(styleName)) {
        throw new Error(`Unknown style: ${styleName}`);
      }

      style = styleName;
      index += 1;
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
      style,
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
      style,
      noColor,
      bell: false,
    };
  }

  return {
    kind: "direct",
    level: "plain",
    style,
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
