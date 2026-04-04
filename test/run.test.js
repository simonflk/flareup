import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cwd = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(cwd, "..");
const cliPath = path.join(cwd, "..", ".test-dist", "cli.js");
const BELL = String.fromCharCode(7);

function runCli(args, envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd: repoRoot,
      env: {
        ...process.env,
        NO_COLOR: "1",
        ...envOverrides,
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

test("bell, notify, help, and version behave as documented", async () => {
  const helpResult = await runCli(["--help"]);
  const versionResult = await runCli(["--version"]);
  const bellResult = await runCli(["--bell", "hello"]);
  const silentBellResult = await runCli([
    "run",
    "--bell",
    "--no-success",
    "--",
    "node",
    "-e",
    "process.exit(0)",
  ]);
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));

  assert.equal(helpResult.code, 0);
  assert.match(helpResult.stdout, /flareup run \[--success <msg>\]/);
  assert.match(helpResult.stdout, /--notify/);
  assert.equal(versionResult.code, 0);
  assert.equal(versionResult.stdout.trim(), packageJson.version);
  assert.equal(bellResult.stdout.endsWith(BELL), true);
  assert.equal(silentBellResult.stdout.trim(), "");
});
