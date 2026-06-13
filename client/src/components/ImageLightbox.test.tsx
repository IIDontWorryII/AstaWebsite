// client/src/components/ImageLightbox.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageLightbox from "./ImageLightbox";

describe("ImageLightbox", () => {
  it("renders nothing when src is null", () => {
    const { container } = render(<ImageLightbox src={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the image and closes on the X button", async () => {
    const onClose = vi.fn();
    render(<ImageLightbox src="/big.jpg" alt="Foto" onClose={onClose} />);
    expect(screen.getByAltText("Foto")).toHaveAttribute("src", "/big.jpg");
    await userEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
