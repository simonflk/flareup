import test from "node:test";
import assert from "node:assert/strict";

import { resolvePresentationTokens } from "../.test-dist/presentation.js";

const unicodeTerminal = {
  width: 80,
  colorEnabled: true,
  unicode: true,
  isTTY: true,
  attentionMode: "bell",
};

test("presentation maps every status to the expected icon and style", () => {
  assert.deepEqual(resolvePresentationTokens("plain", unicodeTerminal), {
    icon: "●",
    styles: ["bold"],
    secondaryStyles: ["dim"],
  });
  assert.deepEqual(resolvePresentationTokens("success", unicodeTerminal), {
    icon: "✓",
    styles: ["bold", "green"],
    secondaryStyles: ["dim"],
  });
  assert.deepEqual(resolvePresentationTokens("error", unicodeTerminal), {
    icon: "✗",
    styles: ["bold", "red"],
    secondaryStyles: ["dim"],
  });
  assert.deepEqual(resolvePresentationTokens("warn", unicodeTerminal), {
    icon: "⚠",
    styles: ["bold", "yellow"],
    secondaryStyles: ["dim"],
  });
  assert.deepEqual(resolvePresentationTokens("info", unicodeTerminal), {
    icon: "ℹ",
    styles: ["bold", "magenta"],
    secondaryStyles: ["dim"],
  });
  assert.deepEqual(resolvePresentationTokens("debug", unicodeTerminal), {
    icon: "●",
    styles: ["bold", "cyan"],
    secondaryStyles: ["dim"],
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
    secondaryStyles: [],
  });
});
