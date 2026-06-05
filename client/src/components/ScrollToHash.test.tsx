// client/src/components/ScrollToHash.test.tsx
//
// Verifies the cross-page anchor fix (AW-46): when navigating to a URL with
// a hash whose target mounts a beat later (async page content), ScrollToHash
// keeps retrying and scrolls once the element appears.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ScrollToHash from "./ScrollToHash";

describe("ScrollToHash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom doesn't implement these — install spies/stubs.
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("scrolls to a hash target that appears after mount", () => {
    render(
      <MemoryRouter initialEntries={["/gremien/asta#referate"]}>
        <ScrollToHash />
      </MemoryRouter>,
    );

    // Target isn't in the DOM yet → nothing scrolled on the first attempt.
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();

    // Simulate the async page content mounting the section.
    const el = document.createElement("section");
    el.id = "referate";
    document.body.appendChild(el);

    // Advance the retry timer → it finds the element and scrolls.
    vi.advanceTimersByTime(150);
    expect(el.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });

    document.body.removeChild(el);
  });

  it("scrolls to top when there is no hash", () => {
    render(
      <MemoryRouter initialEntries={["/eventkalender"]}>
        <ScrollToHash />
      </MemoryRouter>,
    );
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
