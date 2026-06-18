// client/src/components/RichTextEditor.test.tsx
//
// The editor is a TipTap wrapper. ProseMirror's contenteditable is awkward to
// drive via synthetic typing in jsdom, so we test the contract we control:
// initial content renders, the toolbar is present, and toggling a mark flips
// its pressed state (which proves the editor + useEditorState wiring works).

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RichTextEditor, { isEmptyHtml } from "./RichTextEditor";

function Harness({ initial = "<p>Hallo Welt</p>" }: { initial?: string }) {
  return <RichTextEditor value={initial} onChange={() => {}} />;
}

describe("isEmptyHtml", () => {
  it("treats an empty document as empty", () => {
    expect(isEmptyHtml("<p></p>")).toBe(true);
    expect(isEmptyHtml("<p><br></p>")).toBe(true);
    expect(isEmptyHtml("")).toBe(true);
  });
  it("treats real content as non-empty", () => {
    expect(isEmptyHtml("<p>x</p>")).toBe(false);
  });
});

describe("RichTextEditor", () => {
  it("renders the initial content", async () => {
    render(<Harness />);
    expect(await screen.findByText("Hallo Welt")).toBeInTheDocument();
  });

  it("renders the formatting toolbar", () => {
    render(<Harness />);
    for (const label of [
      "Fett",
      "Kursiv",
      "Unterstrichen",
      "Überschrift 2",
      "Überschrift 3",
      "Aufzählung",
      "Nummerierte Liste",
      "Link",
      "Textfarbe",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("flips the bold button's pressed state when toggled", async () => {
    render(<Harness />);
    const bold = screen.getByRole("button", { name: "Fett" });
    expect(bold).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(bold);
    await waitFor(() =>
      expect(bold).toHaveAttribute("aria-pressed", "true"),
    );
  });

  it("opens the colour menu", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Textfarbe" }));
    expect(
      await screen.findByRole("button", { name: "AStA-Rot" }),
    ).toBeInTheDocument();
  });
});
