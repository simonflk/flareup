import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cwd = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(cwd, "..", ".test-dist", "cli.js");

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd: path.join(cwd, ".."),
      env: {
        ...process.env,
        NO_COLOR: "1",
      },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("run mode propagates success and prints the summary", async () => {
  const result = await runCli(["run", "--", "node", "-e", "console.log('hello')"]);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /hello/);
  assert.match(result.stdout, /Command succeeded/);
  assert.match(result.stdout, /node -e console\.log\('hello'\)/);
});

test("run mode propagates failure and prints the exit code", async () => {
  const result = await runCli(["run", "--", "node", "-e", "process.exit(1)"]);

  assert.equal(result.code, 1);
  assert.match(result.stdout, /Command failed \(exit 1,/);
});

test("run mode supports custom messages and suppression flags", async () => {
  const successResult = await runCli([
    "run",
    "--success",
    "yay",
    "--",
    "node",
    "-e",
    "process.exit(0)",
  ]);
  const suppressedSuccessResult = await runCli([
    "run",
    "--no-success",
    "--",
    "node",
    "-e",
    "process.exit(0)",
  ]);
  const suppressedErrorResult = await runCli([
    "run",
    "--no-error",
    "--",
    "node",
    "-e",
    "process.exit(1)",
  ]);

  assert.equal(successResult.code, 0);
  assert.match(successResult.stdout, /yay/);
  assert.equal(suppressedSuccessResult.code, 0);
  assert.equal(suppressedSuccessResult.stdout.trim(), "");
  assert.equal(suppressedErrorResult.code, 1);
  assert.equal(suppressedErrorResult.stdout.trim(), "");
});
