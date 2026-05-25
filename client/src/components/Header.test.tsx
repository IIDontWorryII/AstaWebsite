// client/src/components/Header.test.tsx
//
// Header tests focus on routing/active-state behavior. The auth widget
// (AuthWidget) needs `useAuth()`, which throws outside an AuthProvider —
// so we mock the hook instead of wrapping every test in a provider.
//
// `mockUseAuth` is a vi.fn() so each test can change what useAuth returns
// (logged out vs logged in vs loading) before rendering.

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "./Header";

// Mock the AuthContext module — vi.mock is hoisted to the top of the file
// at runtime, so the import of useAuth inside Header gets our fake.
const mockUseAuth = vi.fn();
vi.mock("@/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Default state for tests that don't care about auth: logged out, not loading.
beforeEach(() => {
  mockUseAuth.mockReturnValue({
    user: null,
    loading: false,
    signup: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  });
});

describe("Header", () => {
  it("marks the Home link active when on the homepage", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveClass("text-asta-red");
  });

  it("renders Gremien as a dropdown trigger and Home is not active when on /gremien", () => {
    render(
      <MemoryRouter initialEntries={["/gremien"]}>
        <Header />
      </MemoryRouter>,
    );

    // Gremien is a NavigationMenuTrigger (a <button>), not a NavLink.
    const gremienTrigger = screen.getByRole("button", { name: /gremien/i });
    expect(gremienTrigger).toBeInTheDocument();

    // Home should no longer be active.
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).not.toHaveClass("text-asta-red");
  });

  it("shows Login and Registrieren when logged out", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    // Login is a plain <Link>, so role="link" works.
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();

    // Registrieren is a styled Button rendering a <Link>; Base UI may
    // expose it as either role. getByText is robust either way; verify
    // it's wrapped in an <a> pointing to /signup.
    const register = screen.getByText("Registrieren");
    const anchor = register.closest("a");
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveAttribute("href", "/signup");
  });

  it("shows the user's display name and a Logout button when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "test@example.com",
        displayName: "Testuser",
        role: "USER",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      loading: false,
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    // Display name is a Link to /profile.
    const profileLink = screen.getByRole("link", { name: "Testuser" });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/profile");

    // Logout button present.
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();

    // Logged-out controls should be gone.
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
  });

  it("renders no auth controls while loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    // Neither logged-out nor logged-in controls are shown during loading.
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });
});
