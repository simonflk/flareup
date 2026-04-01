import test from "node:test";
import assert from "node:assert/strict";

import { renderAlert } from "../.test-dist/render.js";

const ESC = String.fromCharCode(27);
const ANSI_ESCAPE_PATTERN = new RegExp(`${ESC}\\[[0-9;]*m`, "gu");

function stripAnsi(value) {
  return value.replace(ANSI_ESCAPE_PATTERN, "");
}

function render(style, message, width = 20) {
  return stripAnsi(
    renderAlert({
      style,
      lines: [{ text: message, variant: "primary" }],
      width,
      truncateMarker: "…",
      tokens: {
        icon: "●",
        styles: [],
        secondaryStyles: [],
      },
    }),
  );
}

test("box style renders three lines with box borders", () => {
  const lines = render("box", "hello").split("\n");

  assert.equal(lines.length, 3);
  assert.match(lines[0], /^┌.*┐$/);
  assert.match(lines[1], /^│ .* │$/);
  assert.match(lines[2], /^└.*┘$/);
  assert.match(lines[1], /● hello/);
});

test("each style uses the expected chrome and width mode", () => {
  const box = render("box", "hello", 20).split("\n");
  const banner = render("banner", "hello", 20).split("\n");
  const callout = render("callout", "hello", 20).split("\n");
  const line = render("line", "hello", 20).split("\n");
  const minimal = render("minimal", "hello", 20).split("\n");
  const panel = render("panel", "hello", 20).split("\n");

  assert.equal(box[0].length < 20, true);
  assert.equal(banner[0].length, 20);
  assert.equal(callout.length, 1);
  assert.match(callout[0], /^│ /);
  assert.equal(line[0], "─".repeat(20));
  assert.equal(line[2], "─".repeat(20));
  assert.equal(minimal[0], "● hello");
  assert.equal(panel[0], "─".repeat(20));
  assert.equal(panel[2], "═".repeat(20));
});

test("renderer supports multiline messages across styles", () => {
  const box = render("box", "hello\nworld", 20).split("\n");
  const minimal = render("minimal", "hello\nworld", 20).split("\n");

  assert.equal(box.length, 4);
  assert.match(box[1], /● hello/);
  assert.match(box[2], /  world/);
  assert.deepEqual(minimal, ["● hello", "  world"]);
});

test("renderer truncates long lines to the available width", () => {
  const box = render("box", "abcdefghijklmno", 12).split("\n");
  const banner = render("banner", "abcdefghijklmno", 12).split("\n");

  assert.match(box[1], /● abcde…/);
  assert.equal(banner[0].length, 12);
  assert.match(banner[1], /● abcde…/);
});

test("renderer preserves secondary lines for mixed summaries", () => {
  const output = stripAnsi(
    renderAlert({
      style: "box",
      lines: [
        { text: "Command succeeded (1.2s)", variant: "primary" },
        { text: "npm test", variant: "secondary" },
      ],
      width: 40,
      truncateMarker: "…",
      tokens: {
        icon: "✓",
        styles: [],
        secondaryStyles: [],
      },
    }),
  );

  const lines = output.split("\n");

  assert.match(lines[1], /✓ Command succeeded/);
  assert.match(lines[2], /  npm test/);
});
