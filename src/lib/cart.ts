import { CeramicsApi } from "@/api/CeramicsController";
import { EbooksApi } from "@/api/EbooksController";
import { getSeminarById, type Seminar } from "@/api/SeminarsController";
import { toApiError } from "@/api/_axios-client";

export type CartType = "ceramic" | "ebook" | "seminar";
export type CartReference = { type: CartType; id: number };
export type CartItem = CartReference & { quantity: number };

export type CartProduct = {
  title: string;
  titleEn?: string | null;
  imageUrl?: string | null;
  price: number;
  limit: number;
  dateTime?: string;
};

export const cartKey = ({ type, id }: CartReference) => `${type}:${id}`;

export function cartHref({ type, id }: CartReference) {
  if (type === "ceramic") return `/ceramics/${id}`;
  if (type === "ebook") return `/ebook?ebook=${id}`;
  return `/seminars?seminar=${id}`;
}

export function isPaidPrice(price: unknown): price is number {
  return typeof price === "number" && Number.isFinite(price) && price > 0;
}

export function cartProductMissing(error: unknown) {
  return (typeof error === "object" && error !== null && "status" in error && error.status === 404)
    || toApiError(error).status === 404;
}

export function seminarAvailable(seminar: Pick<Seminar, "dateTime" | "price" | "isBookingAvailable">) {
  return seminar.isBookingAvailable && isPaidPrice(seminar.price) && Date.parse(seminar.dateTime) > Date.now();
}

export async function loadCartProduct({ type, id }: CartReference): Promise<CartProduct> {
  if (type === "ceramic") {
    const product = await CeramicsApi.product(id);
    return {
      title: product.title, titleEn: product.titleEn, imageUrl: product.images[0]?.imageUrl,
      price: product.price,
      limit: Number.isFinite(product.price) && product.price >= 0
        && Number.isInteger(product.stockQuantity) && product.stockQuantity > 0 ? product.stockQuantity : 0,
    };
  }

  if (type === "ebook") {
    const ebook = await EbooksApi.get(id);
    return {
      title: ebook.title, titleEn: ebook.titleEn, imageUrl: ebook.coverImageUrl,
      price: ebook.price, limit: isPaidPrice(ebook.price) ? 1 : 0,
    };
  }

  const seminar = await getSeminarById(id);
  return {
    title: seminar.title, titleEn: seminar.titleEn, imageUrl: seminar.imageUrl,
    price: seminar.price, limit: seminarAvailable(seminar) ? 1 : 0, dateTime: seminar.dateTime,
  };
}

export function cartLimit(product: CartProduct) {
  return product.dateTime !== undefined && Date.parse(product.dateTime) <= Date.now() ? 0 : product.limit;
}

export function lineCents(price: number, quantity: number) {
  return Math.round(price * 100) * quantity;
}

export function cartSubtotal(items: CartItem[], products: ReadonlyMap<string, CartProduct>) {
  return items.reduce((total, item) => {
    const product = products.get(cartKey(item));
    return product && item.quantity <= cartLimit(product) ? total + lineCents(product.price, item.quantity) : total;
  }, 0);
}
