import { styleText } from "node:util";

import type { AlertTextStyle, RenderAlertInput } from "./types.js";

function applyStyles(text: string, styles: AlertTextStyle[]): string {
  if (styles.length === 0) {
    return text;
  }

  return styleText(styles, text);
}

function toContentLines(message: string, icon: string): string[] {
  const [firstLine, ...remainingLines] = message.split("\n");

  return [`${icon} ${firstLine}`, ...remainingLines.map((line) => `  ${line}`)];
}

function truncateLine(line: string, width: number, truncateMarker: string): string {
  if (line.length <= width) {
    return line;
  }

  if (width <= truncateMarker.length) {
    return truncateMarker.slice(0, width);
  }

  return `${line.slice(0, width - truncateMarker.length)}${truncateMarker}`;
}

function normalizeWidth(width: number): number {
  return Math.max(width, 8);
}

function renderBoxLike(
  contentLines: string[],
  contentWidth: number,
  left: string,
  right: string,
  topLeft: string,
  topRight: string,
  bottomLeft: string,
  bottomRight: string,
  horizontal: string,
): string[] {
  const top = `${topLeft}${horizontal.repeat(contentWidth + 2)}${topRight}`;
  const body = contentLines.map((line) => `${left} ${line.padEnd(contentWidth, " ")} ${right}`);
  const bottom = `${bottomLeft}${horizontal.repeat(contentWidth + 2)}${bottomRight}`;

  return [top, ...body, bottom];
}

export function renderAlert(input: RenderAlertInput): string {
  const rawContentLines = toContentLines(input.message, input.tokens.icon);
  const width = normalizeWidth(input.width);
  const isFullWidth = input.style === "banner" || input.style === "line" || input.style === "panel";

  let contentWidth = Math.max(...rawContentLines.map((line) => line.length));

  if (input.style === "box") {
    contentWidth = Math.min(contentWidth, width - 4);
  } else if (input.style === "banner") {
    contentWidth = width - 4;
  } else if (input.style === "callout") {
    contentWidth = Math.min(contentWidth, width - 2);
  } else if (input.style === "line" || input.style === "panel") {
    contentWidth = width;
  } else {
    contentWidth = Math.min(contentWidth, width);
  }

  const contentLines = rawContentLines.map((line) =>
    truncateLine(line, contentWidth, input.truncateMarker),
  );
  const paddedWidth = isFullWidth ? contentWidth : Math.max(...contentLines.map((line) => line.length));

  let lines: string[];

  switch (input.style) {
    case "box":
      lines = renderBoxLike(contentLines, paddedWidth, "│", "│", "┌", "┐", "└", "┘", "─");
      break;
    case "banner":
      lines = renderBoxLike(contentLines, paddedWidth, "║", "║", "╔", "╗", "╚", "╝", "═");
      break;
    case "callout":
      lines = contentLines.map((line) => `│ ${line.padEnd(paddedWidth, " ")}`);
      break;
    case "line":
      lines = [
        "─".repeat(paddedWidth),
        ...contentLines.map((line) => line.padEnd(paddedWidth, " ")),
        "─".repeat(paddedWidth),
      ];
      break;
    case "minimal":
      lines = contentLines;
      break;
    case "panel":
      lines = [
        "─".repeat(paddedWidth),
        ...contentLines.map((line) => line.padEnd(paddedWidth, " ")),
        "═".repeat(paddedWidth),
      ];
      break;
    default:
      throw new Error(`Unsupported alert style: ${input.style satisfies never}`);
  }

  return lines.map((line) => applyStyles(line, input.tokens.styles)).join("\n");
}
