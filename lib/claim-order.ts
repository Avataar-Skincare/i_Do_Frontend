import { apiGet } from "@/lib/api";

export type OrderClaimInfo = {
  orderId: string;
  email: string;
  hasAccount: boolean;
};

/** Read-only — doesn't touch auth state, so it doesn't belong in auth-context. */
export function getOrderClaimInfo(token: string): Promise<OrderClaimInfo> {
  return apiGet<OrderClaimInfo>(`/auth/claim-order/${encodeURIComponent(token)}`);
}
