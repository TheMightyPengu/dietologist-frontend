import type { CeramicSort } from "@/api/CeramicsController";

export const ceramicSorts: CeramicSort[] = ["newest", "price_asc", "price_desc"];

export function ceramicPrice(price: number, locale?: string) {
  return new Intl.NumberFormat(locale === "en" ? "en" : "el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}
