import { resolvePresentationTokens } from "./presentation.js";
import { renderAlert } from "./render.js";
import { summarizeRunResult } from "./result-summary.js";
import { getExitCode, runCommand } from "./run.js";
import { detectTerminalCapabilities, renderAttentionSequence } from "./terminal.js";
import type { AlertLevel, AlertStyle, RenderAlertLine, TerminalCapabilities } from "./types.js";

export type { AlertLevel, AlertStyle, TerminalCapabilities };

export interface AlertOptions {
  level?: AlertLevel;
  style?: AlertStyle;
  bell?: boolean;
  notify?: boolean;
  noColor?: boolean;
}

export interface RunOptions {
  success?: string;
  error?: string;
  noSuccess?: boolean;
  noError?: boolean;
  style?: AlertStyle;
  bell?: boolean;
  notify?: boolean;
  noColor?: boolean;
}

export interface RunResult {
  exitCode: number;
  durationMs: number;
}

interface AttentionContent {
  title: string;
  body?: string;
  message: string;
}

function writeOutput(output: string, attention: string): void {
  const suffix = attention.length > 0 ? attention : "";

  process.stdout.write(`${output}\n${suffix}`);
}

function buildLines(message: string): RenderAlertLine[] {
  return message.split("\n").map((text) => ({ text, variant: "primary" as const }));
}

function buildAttentionContent(
  lines: RenderAlertLine[],
  terminal: TerminalCapabilities,
  level: AlertLevel,
): AttentionContent {
  const tokens = resolvePresentationTokens(level, terminal);
  const texts = lines.map((line) => line.text.trim()).filter((text) => text.length > 0);
  const [firstLine, ...rest] = texts;
  const title = firstLine ? `${tokens.icon} ${firstLine}` : `${tokens.icon} flareup`;
  const body = rest.length > 0 ? rest.join(" - ") : undefined;

  return {
    title,
    body,
    message: body ? `${title} - ${body}` : title,
  };
}

export function alert(message: string, options: AlertOptions = {}): void {
  const level = options.level ?? "plain";
  const style = options.style ?? "box";
  const bell = options.bell ?? false;
  const notify = options.notify ?? false;
  const terminal = detectTerminalCapabilities({ noColor: options.noColor ?? false });
  const tokens = resolvePresentationTokens(level, terminal);
  const lines = buildLines(message);
  const output = renderAlert({
    style,
    lines,
    width: terminal.width,
    truncateMarker: terminal.unicode ? "…" : "...",
    tokens,
  });

  const attention =
    bell || notify
      ? renderAttentionOutput(buildAttentionContent(lines, terminal, level), terminal, {
          bell,
          notify,
        })
      : "";

  writeOutput(output, attention);
}

export async function run(command: string[], options: RunOptions = {}): Promise<RunResult> {
  const style = options.style ?? "box";
  const bell = options.bell ?? false;
  const notify = options.notify ?? false;
  const terminal = detectTerminalCapabilities({ noColor: options.noColor ?? false });

  const result = await runCommand(command);
  const summary = summarizeRunResult(result, {
    successMessage: options.success,
    errorMessage: options.error,
    showSuccess: !(options.noSuccess ?? false),
    showError: !(options.noError ?? false),
  });

  if (summary !== null) {
    const tokens = resolvePresentationTokens(summary.level, terminal);
    const output = renderAlert({
      style,
      lines: summary.lines,
      width: terminal.width,
      truncateMarker: terminal.unicode ? "…" : "...",
      tokens,
    });
    const attention =
      bell || notify
        ? renderAttentionOutput(
            buildAttentionContent(summary.lines, terminal, summary.level),
            terminal,
            {
              bell,
              notify,
            },
          )
        : "";

    writeOutput(output, attention);
  }

  const exitCode = getExitCode(result);

  return { exitCode, durationMs: result.durationMs };
}

function renderAttentionOutput(
  content: AttentionContent,
  terminal: TerminalCapabilities,
  options: { bell: boolean; notify: boolean },
): string {
  const parts: string[] = [];

  if (options.notify) {
    parts.push(renderAttentionSequence(content, terminal));
  }

  if (options.bell && (!options.notify || terminal.attentionMode !== "bell")) {
    parts.push("\u0007");
  }

  return parts.join("");
}
