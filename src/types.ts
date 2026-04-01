export type AlertLevel = "plain" | "success" | "error" | "warn" | "info" | "debug";

export type AlertStyle = "box" | "banner" | "callout" | "line" | "minimal" | "panel";

export type AlertTextStyle = "bold" | "green" | "red" | "yellow" | "magenta" | "cyan" | "dim";

export interface AlertCliCommand {
  kind: "direct";
  level: AlertLevel;
  style: AlertStyle;
  message?: string;
  noColor: boolean;
  bell: boolean;
}

export interface RunCliCommand {
  kind: "run";
  style: AlertStyle;
  noColor: boolean;
  bell: boolean;
  command: string[];
  successMessage?: string;
  errorMessage?: string;
  showSuccess: boolean;
  showError: boolean;
}

export type FlareCliCommand = AlertCliCommand | RunCliCommand;

export interface TerminalCapabilities {
  width: number;
  colorEnabled: boolean;
  unicode: boolean;
  isTTY: boolean;
  bellSupported: boolean;
}

export interface RunResult {
  command: string[];
  durationMs: number;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
}

export type RenderLineVariant = "primary" | "secondary";

export interface RenderAlertLine {
  text: string;
  variant: RenderLineVariant;
}

export interface AlertPresentationTokens {
  icon: string;
  styles: AlertTextStyle[];
  secondaryStyles: AlertTextStyle[];
}

export interface RenderAlertInput {
  style: AlertStyle;
  lines: RenderAlertLine[];
  width: number;
  truncateMarker: string;
  tokens: AlertPresentationTokens;
}
