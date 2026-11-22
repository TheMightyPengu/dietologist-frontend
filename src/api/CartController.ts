import { api, toApiError } from "./_axios-client";
import type { CartItem } from "@/lib/cart";

export type CartQuoteLine = CartItem & {
  title: string;
  titleEn: string | null;
  unitPrice: number;
  lineTotal: number;
  seminarStartsAt: string | null;
};

export type CartQuote = {
  items: CartQuoteLine[];
  totalItemCount: number;
  currency: "EUR";
  productsSubtotal: number;
};

export const CartApi = {
  async quote(items: CartItem[], signal?: AbortSignal): Promise<CartQuote> {
    try {
      const { data } = await api.post<CartQuote>("/cart/quote", { items }, { signal });
      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};
