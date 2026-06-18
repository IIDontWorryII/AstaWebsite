// server/html/sanitize.test.ts

import { describe, it, expect } from "vitest";
import { sanitizeRichText, isEmptyRichText } from "./sanitize.js";

describe("sanitizeRichText", () => {
  it("keeps the allowed formatting tags", () => {
    const html =
      "<p>Hallo <strong>Welt</strong> und <em>mehr</em></p><ul><li>eins</li></ul>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("strips a <script> tag but keeps surrounding text", () => {
    const out = sanitizeRichText("<p>hi</p><script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("alert");
    expect(out).toContain("<p>hi</p>");
  });

  it("drops a javascript: link scheme", () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain("javascript:");
  });

  it("forces rel/target on links", () => {
    const out = sanitizeRichText('<a href="https://example.com">x</a>');
    expect(out).toContain('rel="noopener nofollow"');
    expect(out).toContain('target="_blank"');
  });

  it("allows a text colour on spans but removes other styles", () => {
    const out = sanitizeRichText(
      '<p><span style="color: #ff0000; position: fixed">rot</span></p>',
    );
    expect(out).toContain("color");
    expect(out).not.toContain("position");
  });

  it("unwraps a disallowed heading level, keeping the text", () => {
    const out = sanitizeRichText("<h1>Titel</h1>");
    expect(out).not.toContain("<h1>");
    expect(out).toContain("Titel");
  });
});

describe("isEmptyRichText", () => {
  it("treats an empty paragraph as empty", () => {
    expect(isEmptyRichText("<p></p>")).toBe(true);
    expect(isEmptyRichText("<p><br></p>")).toBe(true);
  });

  it("treats real content as non-empty", () => {
    expect(isEmptyRichText("<p>x</p>")).toBe(false);
  });
});
