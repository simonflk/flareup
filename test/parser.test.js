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

test("parseArgv rejects unknown status names when a status and message are provided", () => {
  assert.throws(() => parseArgv(["loud", "hello"]), /unknown status: loud/i);
});

test("validateCommand throws when the message is missing", () => {
  assert.throws(() => validateCommand(parseArgv([])), /message is required/i);
  assert.throws(() => validateCommand(parseArgv(["success"])), /message is required/i);
});
