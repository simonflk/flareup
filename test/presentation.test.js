import test from "node:test";
import assert from "node:assert/strict";

import { resolvePresentationTokens } from "../.test-dist/presentation.js";

const unicodeTerminal = {
  width: 80,
  colorEnabled: true,
  unicode: true,
  isTTY: true,
  bellSupported: true,
};

test("presentation maps every status to the expected icon and style", () => {
  assert.deepEqual(resolvePresentationTokens("plain", unicodeTerminal), {
    icon: "●",
    styles: ["bold"],
  });
  assert.deepEqual(resolvePresentationTokens("success", unicodeTerminal), {
    icon: "✓",
    styles: ["bold", "green"],
  });
  assert.deepEqual(resolvePresentationTokens("error", unicodeTerminal), {
    icon: "✗",
    styles: ["bold", "red"],
  });
  assert.deepEqual(resolvePresentationTokens("warn", unicodeTerminal), {
    icon: "⚠",
    styles: ["bold", "yellow"],
  });
  assert.deepEqual(resolvePresentationTokens("info", unicodeTerminal), {
    icon: "ℹ",
    styles: ["bold", "magenta"],
  });
  assert.deepEqual(resolvePresentationTokens("debug", unicodeTerminal), {
    icon: "●",
    styles: ["bold", "cyan"],
  });
});

test("presentation falls back to ASCII icons and uncolored text when capabilities are limited", () => {
  const tokens = resolvePresentationTokens("success", {
    ...unicodeTerminal,
    colorEnabled: false,
    unicode: false,
  });

  assert.deepEqual(tokens, {
    icon: "√",
    styles: ["bold"],
  });
});
