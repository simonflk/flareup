import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cwd = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(cwd, "..");

function runScript(code, envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", code], {
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

function importPath(mod) {
  return path.join(repoRoot, ".test-dist", mod);
}

test("alert writes a styled message to stdout", async () => {
  const result = await runScript(`
    import { alert } from "${importPath("index.js")}";
    alert("hello world");
  `);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /hello world/);
  assert.match(result.stdout, /[┌└│]/); // box chrome
});

test("alert accepts level and style options", async () => {
  const result = await runScript(`
    import { alert } from "${importPath("index.js")}";
    alert("deployed", { level: "success", style: "minimal" });
  `);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /deployed/);
  // minimal style has no box chrome
  assert.doesNotMatch(result.stdout, /[┌└│]/);
});

test("alert appends bell character when bell option is set", async () => {
  const result = await runScript(`
    import { alert } from "${importPath("index.js")}";
    alert("ding", { bell: true });
  `);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /ding/);
  assert.equal(result.stdout.includes(String.fromCharCode(7)), true);
});

test("alert emits OSC 9 when notify option is set in a supported terminal", async () => {
  const result = await runScript(
    `
      import { alert } from "${importPath("index.js")}";
      Object.defineProperty(process.stdout, "isTTY", { value: true });
      Object.defineProperty(process.stdout, "columns", { value: 80 });
      alert("ding", { notify: true });
    `,
    {
      TERM: "xterm-256color",
      TERM_PROGRAM: "iTerm.app",
    },
  );
  const osc9 = "\u001B]9;● ding\u001B\\";

  assert.equal(result.code, 0);
  assert.equal(result.stdout.includes(osc9), true);
  assert.equal(result.stdout.includes(String.fromCharCode(7)), false);
});

test("run returns exitCode and durationMs", async () => {
  const result = await runScript(`
    import { run } from "${importPath("index.js")}";
    const r = await run(["node", "-e", "process.exit(0)"]);
    process.stdout.write("__RESULT__" + JSON.stringify(r));
  `);

  assert.equal(result.code, 0);
  const json = result.stdout.split("__RESULT__").pop();
  const parsed = JSON.parse(json);
  assert.equal(parsed.exitCode, 0);
  assert.equal(typeof parsed.durationMs, "number");
});

test("run returns non-zero exitCode on failure", async () => {
  const result = await runScript(`
    import { run } from "${importPath("index.js")}";
    const r = await run(["node", "-e", "process.exit(42)"]);
    process.stdout.write("__RESULT__" + JSON.stringify(r));
  `);

  assert.equal(result.code, 0);
  const json = result.stdout.split("__RESULT__").pop();
  const parsed = JSON.parse(json);
  assert.equal(parsed.exitCode, 42);
});

test("run respects noSuccess suppression", async () => {
  const result = await runScript(`
    import { run } from "${importPath("index.js")}";
    await run(["node", "-e", "process.exit(0)"], { noSuccess: true });
  `);

  assert.equal(result.code, 0);
  assert.doesNotMatch(result.stdout, /Command succeeded/);
});

test("run respects noError suppression", async () => {
  const result = await runScript(`
    import { run } from "${importPath("index.js")}";
    await run(["node", "-e", "process.exit(1)"], { noError: true });
  `);

  assert.equal(result.code, 0);
  assert.doesNotMatch(result.stdout, /Command failed/);
});

test("run uses custom success and error messages", async () => {
  const successResult = await runScript(`
    import { run } from "${importPath("index.js")}";
    await run(["node", "-e", "process.exit(0)"], { success: "all good" });
  `);
  const errorResult = await runScript(`
    import { run } from "${importPath("index.js")}";
    await run(["node", "-e", "process.exit(1)"], { error: "boom" });
  `);

  assert.match(successResult.stdout, /all good/);
  assert.match(errorResult.stdout, /boom/);
});
