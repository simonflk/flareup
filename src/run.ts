import { constants } from "node:os";
import { spawn } from "node:child_process";

import type { RunResult } from "./types.js";

interface SpawnCommand {
  command: string;
  args: string[];
}

function quotePosixArgument(argument: string): string {
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(argument)) {
    return argument;
  }

  return `'${argument.replace(/'/g, `'\\''`)}'`;
}

function buildShellCommand(command: string[]): SpawnCommand {
  if (process.platform === "win32") {
    return {
      command: process.env.ComSpec ?? "cmd.exe",
      args: ["/d", "/s", "/c", command.join(" ")],
    };
  }

  return {
    command: process.env.SHELL ?? "/bin/sh",
    args: ["-lc", command.map(quotePosixArgument).join(" ")],
  };
}

export async function runCommand(command: string[]): Promise<RunResult> {
  const spawned = buildShellCommand(command);
  const startedAt = Date.now();

  return await new Promise<RunResult>((resolve, reject) => {
    const child = spawn(spawned.command, spawned.args, {
      stdio: "inherit",
    });

    const forwardSignal = (signal: NodeJS.Signals) => {
      child.kill(signal);
    };

    const cleanup = () => {
      process.off("SIGINT", onSigint);
      process.off("SIGTERM", onSigterm);
    };

    const onSigint = () => {
      forwardSignal("SIGINT");
    };
    const onSigterm = () => {
      forwardSignal("SIGTERM");
    };

    process.on("SIGINT", onSigint);
    process.on("SIGTERM", onSigterm);

    child.once("error", (error) => {
      cleanup();
      reject(error);
    });

    child.once("close", (exitCode, signal) => {
      cleanup();
      resolve({
        command,
        durationMs: Date.now() - startedAt,
        exitCode,
        signal,
      });
    });
  });
}

export function getExitCode(result: RunResult): number {
  if (result.exitCode !== null) {
    return result.exitCode;
  }

  if (result.signal === null) {
    return 1;
  }

  return 128 + (constants.signals[result.signal] ?? 0);
}
