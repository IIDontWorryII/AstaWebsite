// client/src/pages/Profile.test.tsx
//
// Profile now hosts the Logout button (moved off the header in AW-46).
// We mock useAuth so we can assert account info renders and that clicking
// Logout calls the context's logout().

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
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  mockUseAuth.mockReturnValue({
    user,
    loading: false,
    logout: vi.fn().mockResolvedValue(undefined),
    signup: vi.fn(),
    login: vi.fn(),
  });
});

describe("Profile", () => {
  it("renders account info and a Logout button", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Mein Profil" }),
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("calls logout when the Logout button is clicked", async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user,
      loading: false,
      logout,
      signup: vi.fn(),
      login: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
