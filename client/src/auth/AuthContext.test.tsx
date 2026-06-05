// client/src/auth/AuthContext.test.tsx
//
// Tests the AuthProvider's lifecycle:
//   - On mount it calls getMe() and reflects the result in `user`.
//   - login() / logout() update `user` after the underlying API call.
//
// We mock the entire lib/auth module so tests don't touch the network.
// A tiny TestConsumer component reads from useAuth() and renders the
// current state to text — that lets us assert on plain text appearing
// or disappearing, which is the most readable form for context tests.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PublicUser } from "../../../shared/types";
import { AuthProvider, useAuth } from "./AuthContext";

// Define vi.fn mocks at module scope so we can swap their behavior per test.
const mockGetMe = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockSignup = vi.fn();

vi.mock("@/lib/auth", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  login: (...args: unknown[]) => mockLogin(...args),
  logout: (...args: unknown[]) => mockLogout(...args),
  signup: (...args: unknown[]) => mockSignup(...args),
}));

beforeEach(() => {
  mockGetMe.mockReset();
  mockLogin.mockReset();
  mockLogout.mockReset();
  mockSignup.mockReset();
});

const fakeUser: PublicUser = {
  id: "user-1",
  email: "test@example.com",
  displayName: "Testuser",
  role: "USER",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * Renders inside AuthProvider and shows the auth state as plain text.
 * Tests assert on the rendered text rather than poking at hook internals.
 */
function TestConsumer() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="loading">{loading ? "loading" : "ready"}</p>
      <p data-testid="user">{user ? user.displayName : "anonymous"}</p>
      <button
        onClick={() => login({ email: "x@x.de", password: "password123" })}
      >
        login
      </button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  it("starts in loading state and resolves to the user returned by getMe", async () => {
    mockGetMe.mockResolvedValueOnce(fakeUser);

    renderWithProvider();

    // Initially loading. getMe() is in flight.
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    // Once getMe resolves, loading flips to ready and user appears.
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("Testuser");
    expect(mockGetMe).toHaveBeenCalledTimes(1);
  });

  it("resolves to anonymous when getMe returns null (no session)", async () => {
    // getMe returns null when the server responds 401 (mapped inside lib/auth).
    mockGetMe.mockResolvedValueOnce(null);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
  });

  it("treats a getMe rejection as anonymous (network failure tolerance)", async () => {
    // The AuthProvider's catch handler logs the error — suppress it so the
    // test output stays clean while still exercising the failure path.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetMe.mockRejectedValueOnce(new Error("network down"));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");

    errorSpy.mockRestore();
  });

  it("login() updates user state on success", async () => {
    mockGetMe.mockResolvedValueOnce(null); // start logged out
    mockLogin.mockResolvedValueOnce(fakeUser);

    renderWithProvider();

    // Wait past the initial getMe call.
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("anonymous");

    // Click login. userEvent wraps in act() automatically.
    await userEvent.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Testuser");
    });
    expect(mockLogin).toHaveBeenCalledWith({
      email: "x@x.de",
      password: "password123",
    });
  });

  it("logout() clears the user", async () => {
    mockGetMe.mockResolvedValueOnce(fakeUser); // start logged in
    mockLogout.mockResolvedValueOnce(undefined);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Testuser");
    });

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("anonymous");
    });
    expect(mockLogout).toHaveBeenCalled();
  });
});

describe("useAuth", () => {
  it("throws a helpful error when used outside <AuthProvider>", () => {
    // Suppress React's console.error spam during the intentional throw.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Render TestConsumer WITHOUT the provider. React will catch the throw
    // in the component; we expect a render error mentioning AuthProvider.
    expect(() => render(<TestConsumer />)).toThrow(
      /useAuth must be used inside <AuthProvider>/,
    );

    errorSpy.mockRestore();
  });
});

// `act` is imported to make the unused-import linter happy if Vitest's
// auto-wrap doesn't cover a future scenario. Remove if it stays unused.
void act;
