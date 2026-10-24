import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/lib/cart-context";
import { RING_LINE } from "@/tests/fixtures";

function Probe() {
  const { cart, cartCount, cartSubtotal, addItem, removeItem, clearCart } = useCart();
  return (
    <div>
      <output data-testid="state">{JSON.stringify({ lines: cart, cartCount, cartSubtotal })}</output>
      <button onClick={() => addItem({ ...RING_LINE, finish: "Silver", finishId: "silver", qty: 5 })}>add-silver</button>
      <button onClick={() => addItem(RING_LINE)}>add-gold</button>
      <button onClick={() => removeItem(RING_LINE.id, "Gold", "Sizing kit included")}>remove-gold</button>
      <button onClick={clearCart}>clear</button>
    </div>
  );
}
const state = () => JSON.parse(screen.getByTestId("state").textContent!);
const click = (name: string) => act(() => screen.getByText(name).click());

describe("cart: one ring per order (LLD §1)", () => {
  it("starts empty", () => {
    render(<CartProvider><Probe /></CartProvider>);
    expect(state()).toEqual({ lines: [], cartCount: 0, cartSubtotal: 0 });
  });

  it("adding again replaces the ring (e.g. to change finish) and forces qty 1", () => {
    render(<CartProvider><Probe /></CartProvider>);
    click("add-gold");
    click("add-silver");
    const s = state();
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0]).toMatchObject({ finish: "Silver", finishId: "silver", qty: 1 });
    expect(s.cartCount).toBe(1);
    expect(s.cartSubtotal).toBe(1499900);
  });

  it("remove and clear empty the bag", () => {
    render(<CartProvider><Probe /></CartProvider>);
    click("add-gold");
    click("remove-gold");
    expect(state().lines).toEqual([]);
    click("add-gold");
    click("clear");
    expect(state().cartCount).toBe(0);
  });

  it("persists to localStorage", () => {
    render(<CartProvider><Probe /></CartProvider>);
    click("add-gold");
    expect(JSON.parse(localStorage.getItem("ido_cart")!)[0].finishId).toBe("gold");
  });

  it("normalises an old stored cart: drops the standalone kit line, qty 1, kit wording, finishId from the name", () => {
    localStorage.setItem(
      "ido_cart",
      JSON.stringify([
        { id: "kit", name: "Sizing kit", finish: "", size: "", price: 100000, qty: 1, image: "" },
        { id: "ring", name: "Ring", finish: "Space Black", size: "9", price: 1499900, qty: 3, image: "" },
      ]),
    );
    render(<CartProvider><Probe /></CartProvider>);
    const { lines } = state();
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ id: "ring", qty: 1, size: "Sizing kit included", finishId: "black" });
  });

  it("survives a corrupt cart", () => {
    localStorage.setItem("ido_cart", "{not json");
    render(<CartProvider><Probe /></CartProvider>);
    expect(state().lines).toEqual([]);
  });
});
