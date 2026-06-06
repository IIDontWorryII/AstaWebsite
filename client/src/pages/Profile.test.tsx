// client/src/pages/Profile.test.tsx
//
// Profile hosts account info, the Logout button, and the edit form
// (display name + avatar). We mock useAuth so we can assert rendering and
// that Logout / Save call the right context methods.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";

const mockUseAuth = vi.fn();
vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const user = {
  id: "u1",
  email: "test@example.com",
  displayName: "Testuser",
  role: "USER" as const,
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function authValue(over: Record<string, unknown> = {}) {
  return {
    user,
    loading: false,
    logout: vi.fn().mockResolvedValue(undefined),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    changePassword: vi.fn().mockResolvedValue(undefined),
    signup: vi.fn(),
    login: vi.fn(),
    ...over,
  };
}

beforeEach(() => {
  mockUseAuth.mockReturnValue(authValue());
});

describe("Profile", () => {
  it("renders account info, the edit form, and a Logout button", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Mein Profil" }),
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Anzeigename")).toHaveValue("Testuser");
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("calls logout when the Logout button is clicked", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ logout }));

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("saves the edited name via updateProfile", async () => {
    const updateProfile = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ updateProfile }));

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const nameInput = screen.getByLabelText("Anzeigename");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Neuer Name");
    await userEvent.click(screen.getByRole("button", { name: "Speichern" }));

    expect(updateProfile).toHaveBeenCalledTimes(1);
    const [input] = updateProfile.mock.calls[0];
    expect(input).toEqual({ displayName: "Neuer Name" });
  });

  it("changes the password via changePassword", async () => {
    const changePassword = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ changePassword }));

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await userEvent.type(
      screen.getByLabelText("Aktuelles Passwort"),
      "oldpassword1",
    );
    await userEvent.type(
      screen.getByLabelText(/^Neues Passwort \(/),
      "newpassword2",
    );
    await userEvent.type(
      screen.getByLabelText("Neues Passwort bestätigen"),
      "newpassword2",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Passwort ändern" }),
    );

    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "oldpassword1",
      newPassword: "newpassword2",
    });
  });
});
