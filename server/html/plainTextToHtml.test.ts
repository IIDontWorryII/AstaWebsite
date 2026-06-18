// server/html/plainTextToHtml.test.ts

import { describe, it, expect } from "vitest";
import { looksLikeHtml, plainTextToHtml } from "./plainTextToHtml.js";

describe("looksLikeHtml", () => {
  it("detects editor HTML by its known tags", () => {
    expect(looksLikeHtml("<p>hi</p>")).toBe(true);
    expect(looksLikeHtml("a <strong>bold</strong> word")).toBe(true);
    expect(looksLikeHtml('<a href="x">link</a>')).toBe(true);
  });

  it("treats plain text (and unrelated angle brackets) as not HTML", () => {
    expect(looksLikeHtml("just plain text")).toBe(false);
    expect(looksLikeHtml("5 < 10 and 10 > 5")).toBe(false);
    expect(looksLikeHtml("")).toBe(false);
  });
});

describe("plainTextToHtml", () => {
  it("wraps a single line in a paragraph", () => {
    expect(plainTextToHtml("Hello world")).toBe("<p>Hello world</p>");
  });

  it("splits blank-line-separated text into multiple paragraphs", () => {
    expect(plainTextToHtml("First para\n\nSecond para")).toBe(
      "<p>First para</p><p>Second para</p>",
    );
  });

  it("turns single newlines into <br> within a paragraph", () => {
    expect(plainTextToHtml("Line one\nLine two")).toBe(
      "<p>Line one<br>Line two</p>",
    );
  });

  it("escapes HTML-special characters", () => {
    expect(plainTextToHtml("5 < 10 & rising")).toBe(
      "<p>5 &lt; 10 &amp; rising</p>",
    );
  });

  it("returns an empty string for blank input", () => {
    expect(plainTextToHtml("")).toBe("");
    expect(plainTextToHtml("   \n  \n ")).toBe("");
  });
});
