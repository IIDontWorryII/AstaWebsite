import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";

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

    // Gremien is now a NavigationMenuTrigger (a <button>), not a NavLink
    const gremienTrigger = screen.getByRole("button", { name: /gremien/i });
    expect(gremienTrigger).toBeInTheDocument();

    // Home should no longer be active
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).not.toHaveClass("text-asta-red");
  });
});
