import type { AlertLevel, RenderAlertLine, RunResult } from "./types.js";

export interface RunSummary {
  level: AlertLevel;
  lines: RenderAlertLine[];
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

export function summarizeRunResult(result: RunResult): RunSummary | null {
  if (result.signal !== null) {
    return null;
  }

  if (result.exitCode === 0) {
    return {
      level: "success",
      lines: [
        {
          text: `Command succeeded (${formatDuration(result.durationMs)})`,
          variant: "primary",
        },
        {
          text: result.command.join(" "),
          variant: "secondary",
        },
      ],
    };
  }

  return {
    level: "error",
    lines: [
      {
        text: `Command failed (exit ${result.exitCode ?? 1}, ${formatDuration(result.durationMs)})`,
        variant: "primary",
      },
      {
        text: result.command.join(" "),
        variant: "secondary",
      },
    ],
  };
}
