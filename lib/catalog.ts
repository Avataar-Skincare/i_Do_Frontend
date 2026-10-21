import { apiGet, apiPost } from "@/lib/api";

export type FinishId = "gold" | "silver" | "black";
export type PaymentMethod = "online" | "cod";

/** GET /catalog — prices come from server settings; sizes are informational only. All money is paise. */
export type Catalog = {
  pricePaise: number;
  listPricePaise: number;
  kitIncluded: boolean;
  codFeePaise: number;
  codEnabled: boolean;
  finishes: Array<{ id: FinishId; name: string; sizes: Array<{ us: number; inStock: boolean }> }>;
  offer: { enabled: boolean };
  socialProof: unknown;
};

/** POST /orders/quote — server-computed totals, display only; POST /orders re-quotes. */
export type Quote = {
  subtotal: number;
  codFee: number;
  discount: number;
  total: number;
  codAvailable: boolean;
  codReason?: "cod_disabled" | "pincode_not_serviceable";
};

export function getCatalog(): Promise<Catalog> {
  return apiGet<Catalog>("/catalog");
}

/** The client never sends a price — only the finish, payment method and delivery PIN. */
export function quoteOrder(input: { finish: FinishId; paymentMethod: PaymentMethod; pin: string }): Promise<Quote> {
  return apiPost<Quote>("/orders/quote", input);
}
