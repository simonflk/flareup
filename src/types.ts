export type AlertLevel = "plain" | "success" | "error" | "warn" | "info" | "debug";

export type AlertStyle = "box" | "banner" | "callout" | "line" | "minimal" | "panel";

export type AlertTextStyle =
  | "bold"
  | "green"
  | "red"
  | "yellow"
  | "magenta"
  | "cyan"
  | "dim";

export interface AlertCliCommand {
  kind: "direct";
  level: AlertLevel;
  style: AlertStyle;
  message?: string;
  noColor: boolean;
  bell: boolean;
}

export interface TerminalCapabilities {
  width: number;
  colorEnabled: boolean;
  unicode: boolean;
  isTTY: boolean;
  bellSupported: boolean;
}

export interface AlertPresentationTokens {
  icon: string;
  styles: AlertTextStyle[];
}

export interface RenderAlertInput {
  style: AlertStyle;
  message: string;
  width: number;
  truncateMarker: string;
  tokens: AlertPresentationTokens;
}
