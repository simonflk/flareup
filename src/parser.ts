import type { AlertCliCommand, AlertLevel, FlareCliCommand } from "./types.js";

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

export function parseArgv(argv: string[]): FlareCliCommand {
  const separatorIndex = argv.indexOf("--");
  const cliArgs = separatorIndex === -1 ? argv : argv.slice(0, separatorIndex);
  const commandArgs = separatorIndex === -1 ? [] : argv.slice(separatorIndex + 1);
  const positionals: string[] = [];
  let noColor = false;
  let bell = false;
  let style: AlertCliCommand["style"] = "box";
  let successMessage: string | undefined;
  let errorMessage: string | undefined;
  let showSuccess = true;
  let showError = true;
  let usedRunFlag = false;

  for (let index = 0; index < cliArgs.length; index += 1) {
    const argument = cliArgs[index];

    if (argument === "--no-color") {
      noColor = true;
      continue;
    }

    if (argument === "--bell") {
      bell = true;
      continue;
    }

    if (argument === "--help") {
      return { kind: "help" };
    }

    if (argument === "--version") {
      return { kind: "version" };
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

    if (argument === "--success" || argument === "--error") {
      const value = cliArgs[index + 1];

      if (!value) {
        throw new Error(`Missing value for ${argument}`);
      }

      if (argument === "--success") {
        successMessage = value;
      } else {
        errorMessage = value;
      }

      usedRunFlag = true;
      index += 1;
      continue;
    }

    if (argument === "--no-success" || argument === "--no-error") {
      if (argument === "--no-success") {
        showSuccess = false;
      } else {
        showError = false;
      }

      usedRunFlag = true;
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

  if (positionals[0] === "run") {
    if (positionals.length > 1) {
      throw new Error(`Unexpected argument: ${positionals[1]}`);
    }

    return {
      kind: "run",
      style,
      noColor,
      bell,
      command: commandArgs,
      successMessage,
      errorMessage,
      showSuccess,
      showError,
    };
  }

  if (usedRunFlag) {
    throw new Error("Run-only flags can only be used with run mode.");
  }

  if (separatorIndex !== -1) {
    throw new Error("The -- separator is only valid with run mode.");
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
      bell,
    };
  }

  const [message] = positionals;

  if (message && isAlertLevel(message)) {
    return {
      kind: "direct",
      level: message,
      style,
      noColor,
      bell,
    };
  }

  return {
    kind: "direct",
    level: "plain",
    style,
    message,
    noColor,
    bell,
  };
}

export function validateCommand(command: FlareCliCommand): FlareCliCommand {
  if (command.kind === "help" || command.kind === "version") {
    return command;
  }

  if (command.kind === "run") {
    if (command.command.length === 0) {
      throw new Error("A command is required after --.");
    }

    return command;
  }

  if (!command.message || command.message.length === 0) {
    throw new Error("A message is required.");
  }

  return command;
}
