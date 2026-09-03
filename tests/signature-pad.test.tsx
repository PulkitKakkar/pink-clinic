// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SignaturePad } from "@/components/admin/signature-pad";

const saved = "data:image/png;base64,saved";
const replacement = "data:image/png;base64,replacement";
const context = {
  scale: vi.fn(), fillRect: vi.fn(), drawImage: vi.fn(), beginPath: vi.fn(),
  moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), closePath: vi.fn(),
};
function data() {
  return screen.getByLabelText<HTMLInputElement>("Customer signature data").value;
}
function draw() {
  const canvas = screen.getByLabelText("Customer signature pad");
  fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10 });
  fireEvent.pointerMove(canvas, { clientX: 30, clientY: 30 });
  fireEvent.pointerUp(canvas);
}
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(replacement);
  Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", { configurable: true, value: vi.fn() });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.clearAllMocks(); });

describe("saved signature protection", () => {
  it("preserves saved data during swipes and declined updates", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<SignaturePad defaultValue={saved} />);
    draw();
    expect(context.stroke).not.toHaveBeenCalled();
    expect(data()).toBe(saved);
    fireEvent.click(screen.getByRole("button", { name: "Update customer signature" }));
    expect(confirm).toHaveBeenCalledOnce();
    draw();
    expect(data()).toBe(saved);
    expect(screen.getByRole("button", { name: "Update customer signature" })).toBeTruthy();
  });
  it("keeps the saved signature until a new stroke after confirmation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<SignaturePad defaultValue={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Update customer signature" }));
    expect(data()).toBe(saved);
    expect(screen.queryByRole("button", { name: "Update customer signature" })).toBeNull();
    const fills = context.fillRect.mock.calls.length;
    draw();
    expect(context.fillRect).toHaveBeenCalledTimes(fills + 1);
    expect(data()).toBe(replacement);
    draw();
    expect(context.fillRect).toHaveBeenCalledTimes(fills + 1);
  });
  it("requires confirmation to clear and does not restore cleared data on resize", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<SignaturePad defaultValue={saved} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(data()).toBe(saved);
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(data()).toBe("");
    fireEvent(window, new Event("resize"));
    expect(data()).toBe("");
    expect(context.drawImage).not.toHaveBeenCalled();
  });
  it("allows a blank signature to be drawn without confirmation", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<SignaturePad />);
    draw();
    expect(data()).toBe(replacement);
    expect(confirm).not.toHaveBeenCalled();
  });
});
