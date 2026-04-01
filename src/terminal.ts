import type { TerminalCapabilities } from "./types.js";

const DEFAULT_WIDTH = 80;

interface DetectTerminalCapabilitiesOptions {
  env?: NodeJS.ProcessEnv;
  noColor?: boolean;
  stdout?: Pick<NodeJS.WriteStream, "columns" | "isTTY">;
}

export function detectTerminalCapabilities(
  options: DetectTerminalCapabilitiesOptions = {},
): TerminalCapabilities {
  const env = options.env ?? process.env;
  const stdout = options.stdout ?? process.stdout;
  const isDumbTerminal = env.TERM === "dumb";
  const colorEnabled = Boolean(stdout.isTTY) && !options.noColor && env.NO_COLOR === undefined;

  return {
    width: stdout.columns ?? DEFAULT_WIDTH,
    colorEnabled,
    unicode: !isDumbTerminal,
    isTTY: Boolean(stdout.isTTY),
    bellSupported: Boolean(stdout.isTTY),
  };
}
