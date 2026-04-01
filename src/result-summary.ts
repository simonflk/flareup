import type { AlertLevel, RenderAlertLine, RunResult } from "./types.js";

export interface RunSummary {
  level: AlertLevel;
  lines: RenderAlertLine[];
}

export interface RunSummaryOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccess: boolean;
  showError: boolean;
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  const seconds = durationMs / 1000;

  if (Number.isInteger(seconds)) {
    return `${seconds}s`;
  }

  return `${seconds.toFixed(1)}s`;
}

export function summarizeRunResult(
  result: RunResult,
  options: RunSummaryOptions,
): RunSummary | null {
  if (result.signal !== null) {
    return null;
  }

  if (result.exitCode === 0) {
    if (!options.showSuccess) {
      return null;
    }

    return {
      level: "success",
      lines: [
        {
          text:
            options.successMessage ?? `Command succeeded (${formatDuration(result.durationMs)})`,
          variant: "primary",
        },
        {
          text: result.command.join(" "),
          variant: "secondary",
        },
      ],
    };
  }

  if (!options.showError) {
    return null;
  }

  return {
    level: "error",
    lines: [
      {
        text:
          options.errorMessage ??
          `Command failed (exit ${result.exitCode ?? 1}, ${formatDuration(result.durationMs)})`,
        variant: "primary",
      },
      {
        text: result.command.join(" "),
        variant: "secondary",
      },
    ],
  };
}
