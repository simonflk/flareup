import type { AlertLevel, AlertPresentationTokens, TerminalCapabilities } from "./types.js";

const COLOR_STYLES: Record<Exclude<AlertLevel, "plain">, AlertPresentationTokens["styles"]> = {
  success: ["bold", "green"],
  error: ["bold", "red"],
  warn: ["bold", "yellow"],
  info: ["bold", "magenta"],
  debug: ["bold", "cyan"],
};

const UNICODE_ICONS: Record<AlertLevel, string> = {
  plain: "●",
  success: "✓",
  error: "✗",
  warn: "⚠",
  info: "ℹ",
  debug: "●",
};

const ASCII_ICONS: Record<AlertLevel, string> = {
  plain: "*",
  success: "√",
  error: "x",
  warn: "!",
  info: "i",
  debug: "*",
};

export function resolvePresentationTokens(
  level: AlertLevel,
  terminal: TerminalCapabilities,
): AlertPresentationTokens {
  const iconSet = terminal.unicode ? UNICODE_ICONS : ASCII_ICONS;

  if (level === "plain") {
    return {
      icon: iconSet.plain,
      styles: ["bold"],
      secondaryStyles: terminal.colorEnabled ? ["dim"] : [],
    };
  }

  return {
    icon: iconSet[level],
    styles: terminal.colorEnabled ? COLOR_STYLES[level] : ["bold"],
    secondaryStyles: terminal.colorEnabled ? ["dim"] : [],
  };
}
