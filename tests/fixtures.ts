import type { Order } from "@/lib/orders-storage";
import type { AuthUser } from "@/lib/auth-context";

export const USER: AuthUser = {
  id: "u1", email: "asha@x.in", phone: "9876543210", fullName: "Asha Rao", role: "user",
  createdAt: "2026-10-20T00:00:00Z", emailVerifiedAt: "2026-10-20T00:00:00Z", phoneVerifiedAt: "2026-10-20T00:00:00Z",
};

export const RING_LINE = {
  id: "ring", name: "i do Smart Ring", finish: "Gold", finishId: "gold", size: "Sizing kit included",
  price: 1499900, qty: 1, image: "/ring.png",
};

export function order(over: Partial<Order> = {}): Order {
  return {
    id: "IDO-ABC123", status: "kit_delivered", cancelReason: null, paymentMethod: "online", finish: "gold", usSize: null,
    unitPrice: 1499900, listPrice: 1499900, subtotal: 1499900, codFee: 0, discount: 0, total: 1499900, amountPaid: 1499900,
    kitPriceSnapshot: 100000,
    customer: { name: "Asha Rao", email: "asha@x.in", phone: "9876543210" },
    address: { line: "1 MG Road", city: "Pune", state: "MH", pin: "411001" },
    sizeDueAt: null, createdAt: "2026-10-20T10:00:00Z", updatedAt: "2026-10-20T10:00:00Z", shipments: [], refund: null,
    ...over,
  };
}
