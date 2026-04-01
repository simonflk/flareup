import { styleText } from "node:util";

import type { AlertTextStyle, RenderAlertInput, RenderAlertLine, RenderLineVariant } from "./types.js";

function applyStyles(text: string, styles: AlertTextStyle[]): string {
  if (styles.length === 0) {
    return text;
  }

  return styleText(styles, text);
}

interface DecoratedLine {
  text: string;
  variant: RenderLineVariant;
}

function styleForVariant(input: RenderAlertInput, variant: RenderLineVariant): AlertTextStyle[] {
  return variant === "secondary" ? input.tokens.secondaryStyles : input.tokens.styles;
}

function toContentLines(lines: RenderAlertLine[], icon: string): DecoratedLine[] {
  const decorated: DecoratedLine[] = [];

  lines.forEach((line, lineIndex) => {
    const physicalLines = line.text.split("\n");

    physicalLines.forEach((physicalLine, physicalLineIndex) => {
      const isFirstRenderedLine = lineIndex === 0 && physicalLineIndex === 0;

      decorated.push({
        text: isFirstRenderedLine ? `${icon} ${physicalLine}` : `  ${physicalLine}`,
        variant: line.variant,
      });
    });
  });

  return decorated;
}

function truncateLine(line: DecoratedLine, width: number, truncateMarker: string): DecoratedLine {
  if (line.text.length <= width) {
    return line;
  }

  if (width <= truncateMarker.length) {
    return {
      ...line,
      text: truncateMarker.slice(0, width),
    };
  }

  return {
    ...line,
    text: `${line.text.slice(0, width - truncateMarker.length)}${truncateMarker}`,
  };
}

function normalizeWidth(width: number): number {
  return Math.max(width, 8);
}

function renderBoxLike(
  input: RenderAlertInput,
  contentLines: DecoratedLine[],
  contentWidth: number,
  left: string,
  right: string,
  topLeft: string,
  topRight: string,
  bottomLeft: string,
  bottomRight: string,
  horizontal: string,
): string[] {
  const top = applyStyles(`${topLeft}${horizontal.repeat(contentWidth + 2)}${topRight}`, input.tokens.styles);
  const body = contentLines.map((line) => {
    const padded = line.text.padEnd(contentWidth, " ");

    return `${applyStyles(left, input.tokens.styles)} ${applyStyles(
      padded,
      styleForVariant(input, line.variant),
    )} ${applyStyles(right, input.tokens.styles)}`;
  });
  const bottom = applyStyles(
    `${bottomLeft}${horizontal.repeat(contentWidth + 2)}${bottomRight}`,
    input.tokens.styles,
  );

  return [top, ...body, bottom];
}

export function renderAlert(input: RenderAlertInput): string {
  const rawContentLines = toContentLines(input.lines, input.tokens.icon);
  const width = normalizeWidth(input.width);
  const isFullWidth = input.style === "banner" || input.style === "line" || input.style === "panel";

  let contentWidth = Math.max(...rawContentLines.map((line) => line.text.length));

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
  const paddedWidth = isFullWidth
    ? contentWidth
    : Math.max(...contentLines.map((line) => line.text.length));

  let lines: string[];

  switch (input.style) {
    case "box":
      lines = renderBoxLike(input, contentLines, paddedWidth, "│", "│", "┌", "┐", "└", "┘", "─");
      break;
    case "banner":
      lines = renderBoxLike(input, contentLines, paddedWidth, "║", "║", "╔", "╗", "╚", "╝", "═");
      break;
    case "callout":
      lines = contentLines.map(
        (line) =>
          `${applyStyles("│", input.tokens.styles)} ${applyStyles(
            line.text.padEnd(paddedWidth, " "),
            styleForVariant(input, line.variant),
          )}`,
      );
      break;
    case "line":
      lines = [
        applyStyles("─".repeat(paddedWidth), input.tokens.styles),
        ...contentLines.map((line) =>
          applyStyles(line.text.padEnd(paddedWidth, " "), styleForVariant(input, line.variant)),
        ),
        applyStyles("─".repeat(paddedWidth), input.tokens.styles),
      ];
      break;
    case "minimal":
      lines = contentLines.map((line) => applyStyles(line.text, styleForVariant(input, line.variant)));
      break;
    case "panel":
      lines = [
        applyStyles("─".repeat(paddedWidth), input.tokens.styles),
        ...contentLines.map((line) =>
          applyStyles(line.text.padEnd(paddedWidth, " "), styleForVariant(input, line.variant)),
        ),
        applyStyles("═".repeat(paddedWidth), input.tokens.styles),
      ];
      break;
    default:
      throw new Error(`Unsupported alert style: ${input.style satisfies never}`);
  }

  return lines.join("\n");
}
