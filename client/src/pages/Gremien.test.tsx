import { render, screen } from "@testing-library/react";
import Gremien from "../pages/Gremien";

describe("Gremien page", () => {
  it("renders the page heading", () => {
    render(<Gremien />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Gremien" }),
    ).toBeInTheDocument();
  });
});
