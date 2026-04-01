import test from "node:test";
import assert from "node:assert/strict";

import { parseArgv, validateCommand } from "../.test-dist/parser.js";

test("parseArgv extracts the direct message", () => {
  const command = validateCommand(parseArgv(["hello"]));

  assert.equal(command.kind, "direct");
  assert.equal(command.level, "plain");
  assert.equal(command.style, "box");
  assert.equal(command.message, "hello");
});

test("parseArgv accepts each status positional", () => {
  for (const level of ["success", "error", "warn", "info", "debug"]) {
    const command = validateCommand(parseArgv([level, "hello"]));

    assert.equal(command.level, level);
    assert.equal(command.message, "hello");
  }
});

test("parseArgv recognizes --no-color", () => {
  const command = validateCommand(parseArgv(["success", "hello", "--no-color"]));

  assert.equal(command.noColor, true);
});

test("parseArgv recognizes --style", () => {
  const command = validateCommand(parseArgv(["success", "hello", "--style", "banner"]));

  assert.equal(command.style, "banner");
});

test("parseArgv parses run mode and command arguments", () => {
  const command = validateCommand(parseArgv(["run", "--style", "panel", "--", "echo", "hello"]));

  assert.equal(command.kind, "run");
  assert.equal(command.style, "panel");
  assert.deepEqual(command.command, ["echo", "hello"]);
});

test("parseArgv rejects unknown status names when a status and message are provided", () => {
  assert.throws(() => parseArgv(["loud", "hello"]), /unknown status: loud/i);
});

test("parseArgv rejects invalid style names", () => {
  assert.throws(() => parseArgv(["hello", "--style", "loud"]), /unknown style: loud/i);
});

test("validateCommand throws when the message is missing", () => {
  assert.throws(() => validateCommand(parseArgv([])), /message is required/i);
  assert.throws(() => validateCommand(parseArgv(["success"])), /message is required/i);
  assert.throws(() => validateCommand(parseArgv(["run", "--"])), /command is required/i);
});
