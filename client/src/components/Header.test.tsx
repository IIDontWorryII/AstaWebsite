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

  it("marks the Gremien link active when on /gremien", () => {
    render(
      <MemoryRouter initialEntries={["/gremien"]}>
        <Header />
      </MemoryRouter>,
    );

    const gremienLink = screen.getByRole("link", { name: "Gremien" });
    expect(gremienLink).toHaveClass("text-asta-red");

    // Home should no longer be active
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).not.toHaveClass("text-asta-red");
  });
});
