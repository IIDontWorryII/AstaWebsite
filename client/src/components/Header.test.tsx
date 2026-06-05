// client/src/components/Header.test.tsx
//
// Header tests focus on routing/active-state behavior. The auth widget
// (AuthWidget) needs `useAuth()`, which throws outside an AuthProvider —
// so we mock the hook instead of wrapping every test in a provider.
//
// `mockUseAuth` is a vi.fn() so each test can change what useAuth returns
// (logged out vs logged in vs loading) before rendering.

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("shows the profile avatar link (no header Logout) when logged in", () => {
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

    // Profile is now an avatar link to /profile labelled "Mein Profil".
    const profileLink = screen.getByRole("link", { name: "Mein Profil" });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/profile");

    // A plain USER does not see the EDITOR-only Admin link.
    expect(screen.queryByRole("link", { name: "Admin" })).not.toBeInTheDocument();

    // Logout moved to the profile page — it is NOT in the header anymore.
    expect(
      screen.queryByRole("button", { name: "Logout" }),
    ).not.toBeInTheDocument();

    // Logged-out controls should be gone.
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByText("Registrieren")).not.toBeInTheDocument();
  });

  it("does not show Kontakt in the header nav (it moved to the footer)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole("link", { name: "Kontakt" }),
    ).not.toBeInTheDocument();
  });

  it("shows an Admin link for EDITOR users", () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: "editor-1",
        email: "editor@example.com",
        displayName: "Editor",
        role: "EDITOR",
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

    const adminLink = screen.getByRole("link", { name: "Admin" });
    expect(adminLink).toHaveAttribute("href", "/admin");
  });

  it("opens the mobile menu from the hamburger and shows the nav links", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>,
    );

    // Panel is not mounted until the hamburger is tapped.
    expect(document.getElementById("mobile-menu")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Menü öffnen" }));

    const panel = document.getElementById("mobile-menu");
    expect(panel).not.toBeNull();
    // Nav links live inside the panel.
    expect(
      within(panel as HTMLElement).getByRole("link", { name: "Eventkalender" }),
    ).toBeInTheDocument();
    expect(
      within(panel as HTMLElement).getByRole("link", { name: "BaRACke" }),
    ).toBeInTheDocument();

    // Hamburger flips to a close affordance.
    expect(
      screen.getByRole("button", { name: "Menü schließen" }),
    ).toBeInTheDocument();
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
