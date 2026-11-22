import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "@/components/hooks/useTranslations";
import { cartLimit, cartProductMissing, loadCartProduct, type CartReference } from "@/lib/cart";
import { useCart } from "./CartProvider";

export default function AddToCart({ type, id, limit }: CartReference & { limit: number }) {
  const { cart: copy } = useTranslations();
  const { ready, quantityOf, add } = useCart();
  const reference = { type, id };
  const inCart = quantityOf(reference);
  const [quantity, setQuantity] = useState("1");
  const [latestLimit, setLatestLimit] = useState(limit);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<"added" | "unavailable" | "loadError" | "invalidQuantity">();
  const submitting = useRef(false);
  const remaining = Math.max(0, Math.min(latestLimit, limit) - inCart);
  const ceramic = type === "ceramic";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !ready || !remaining) return;
    const requested = ceramic ? Number(quantity) : 1;
    if (!Number.isInteger(requested) || requested < 1 || requested > remaining) {
      setMessage("invalidQuantity");
      return;
    }

    submitting.current = true;
    setPending(true);
    setMessage(undefined);
    try {
      const product = await loadCartProduct(reference);
      const maximum = cartLimit(product);
      setLatestLimit(maximum);
      if (maximum === 0) {
        setMessage("unavailable");
      } else if (add(reference, requested, maximum)) {
        setQuantity("1");
        setMessage("added");
      } else {
        setMessage("invalidQuantity");
      }
    } catch (error) {
      if (cartProductMissing(error)) setLatestLimit(0);
      setMessage(cartProductMissing(error) ? "unavailable" : "loadError");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (!ceramic && inCart) {
    return <Link href="/cart" className="text-sm font-semibold text-primary underline underline-offset-4">{copy.inCart} · {copy.viewCart}</Link>;
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        {ceramic && (
          <label className="text-xs font-semibold text-slate-700">
            {copy.quantity}
            <input
              type="number" min={1} max={remaining} step={1} value={quantity}
              onChange={(event) => { setQuantity(event.target.value); setMessage(undefined); }}
              disabled={!ready || pending || !remaining}
              className="mt-1 block w-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        )}
        <button type="submit" disabled={!ready || pending || !remaining} className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60">
          <ShoppingBag size={16} aria-hidden="true" />
          {pending ? copy.loading : copy.add}
        </button>
      </div>
      <p role="status" className="text-sm text-slate-700">
        {message ? copy[message] : ceramic && inCart > 0 && !remaining ? copy.stockLimit : null}
        {(message === "added" || inCart > 0) && (
          <> <Link href="/cart" className="font-semibold text-primary underline underline-offset-4">{copy.viewCart}</Link></>
        )}
      </p>
    </form>
  );
}
