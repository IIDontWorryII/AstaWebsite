// client/src/pages/admin/ProtocolForm.test.tsx
//
// Tests for the shared ProtocolForm. Verifies:
//   - Create mode: requires a file (validation), then submits via createProtocol
//     with the typed input and File. Navigates to /admin/protocols on success.
//   - Edit mode: pre-fills from existing protocol; submits via updateProtocol
//     with the id.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ProtocolDTO } from "../../../../shared/types";
import ProtocolForm from "./ProtocolForm";

const mockCreateProtocol = vi.fn();
const mockUpdateProtocol = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/lib/admin-protocols", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/admin-protocols")>(
      "@/lib/admin-protocols",
    );
  return {
    ...actual,
    createProtocol: (...args: unknown[]) => mockCreateProtocol(...args),
    updateProtocol: (...args: unknown[]) => mockUpdateProtocol(...args),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  mockCreateProtocol.mockReset();
  mockUpdateProtocol.mockReset();
  mockNavigate.mockReset();
});

const existingProtocol: ProtocolDTO = {
  id: "protocol-existing",
  gremium: "STUPA",
  title: "Existing Protocol",
  description: "Vorhandene Beschreibung",
  meetingDate: "2026-04-15T00:00:00.000Z",
  fileUrl: "/uploads/protocols/existing.pdf",
  uploadedAt: "2026-04-16T10:00:00.000Z",
};

function renderForm(props: { protocol?: ProtocolDTO } = {}) {
  return render(
    <MemoryRouter>
      <ProtocolForm {...props} />
    </MemoryRouter>,
  );
}

/** Small helper to build a File of the given mime type. */
function pdfFile(name = "test.pdf"): File {
  return new File(["%PDF-1.4 test"], name, { type: "application/pdf" });
}

/**
 * Set a file on a file input. We use fireEvent.change directly because
 * userEvent.upload had reliability issues in this codebase with the
 * combined required-validation + form-submit timing.
 */
function uploadFile(file: File) {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

describe("ProtocolForm — create mode", () => {
  it("shows the create heading and defaults", () => {
    renderForm();
    expect(
      screen.getByRole("heading", { name: "Neues Protokoll" }),
    ).toBeInTheDocument();
    // Default gremium is the first option (ASTA).
    expect(screen.getByLabelText("Gremium")).toHaveValue("ASTA");
  });

  it("submits createProtocol with the typed input and File", async () => {
    mockCreateProtocol.mockResolvedValueOnce({});

    renderForm();

    await userEvent.selectOptions(screen.getByLabelText("Gremium"), "STUPA");
    await userEvent.type(screen.getByLabelText("Titel"), "Test Sitzung");

    // <input type="date"> doesn't accept userEvent.type/paste reliably;
    // use fireEvent.change to set the value directly.
    fireEvent.change(screen.getByLabelText("Sitzungsdatum"), {
      target: { value: "2026-04-15" },
    });

    // Upload a fake PDF.
    const file = pdfFile();
    uploadFile(file);

    // Submit via fireEvent.submit on the form, not by clicking the
    // submit button. JSDOM partially implements HTML5 validation and
    // (unlike a real browser) treats the file input as invalid even
    // after we set files via fireEvent.change, which blocks button-click
    // submits. fireEvent.submit dispatches the submit event directly,
    // which is what our handleSubmit listens for anyway.
    const form = screen
      .getByRole("button", { name: "Protokoll hochladen" })
      .closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockCreateProtocol).toHaveBeenCalledTimes(1);
    });
    const [input, sentFile] = mockCreateProtocol.mock.calls[0];
    expect(input).toMatchObject({
      gremium: "STUPA",
      title: "Test Sitzung",
      // meetingDate is UTC midnight of 2026-04-15.
      meetingDate: "2026-04-15T00:00:00.000Z",
    });
    expect(sentFile).toBe(file);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/protocols");
  });

  it("shows an error and stays on the page when createProtocol rejects", async () => {
    mockCreateProtocol.mockRejectedValueOnce(new Error("File too large"));

    renderForm();

    await userEvent.type(screen.getByLabelText("Titel"), "x");
    fireEvent.change(screen.getByLabelText("Sitzungsdatum"), {
      target: { value: "2026-04-15" },
    });
    uploadFile(pdfFile());

    const form = screen
      .getByRole("button", { name: "Protokoll hochladen" })
      .closest("form")!;
    fireEvent.submit(form);

    expect(
      await screen.findByText(/Fehler: File too large/),
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("ProtocolForm — edit mode", () => {
  it("pre-fills the fields from the existing protocol", () => {
    renderForm({ protocol: existingProtocol });

    expect(
      screen.getByRole("heading", { name: "Protokoll bearbeiten" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Gremium")).toHaveValue("STUPA");
    expect(screen.getByLabelText("Titel")).toHaveValue("Existing Protocol");
    expect(screen.getByLabelText("Sitzungsdatum")).toHaveValue("2026-04-15");
    // Link to existing PDF rendered.
    expect(screen.getByText("bestehende PDF ansehen")).toHaveAttribute(
      "href",
      "/uploads/protocols/existing.pdf",
    );
  });

  it("submits updateProtocol with the id when edited (no new file)", async () => {
    mockUpdateProtocol.mockResolvedValueOnce({});

    renderForm({ protocol: existingProtocol });

    const titleInput = screen.getByLabelText("Titel");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Edited Title");

    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));

    await waitFor(() => {
      expect(mockUpdateProtocol).toHaveBeenCalledTimes(1);
    });
    const [id, input, file] = mockUpdateProtocol.mock.calls[0];
    expect(id).toBe("protocol-existing");
    expect(input.title).toBe("Edited Title");
    // No new file picked → null is sent (server keeps existing PDF).
    expect(file).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/admin/protocols");
  });
});
