import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cartKey, type CartItem, type CartReference } from "@/lib/cart";

const storageKey = "dietologist.cart";
const maxQuantity = 2_147_483_647;

function readItems(raw: string | null): CartItem[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || !("items" in parsed) || !Array.isArray(parsed.items)) return [];

    const items = new Map<string, CartItem>();
    for (const value of parsed.items) {
      if (!value || typeof value !== "object") continue;
      const { type, id, quantity } = value as Partial<CartItem>;
      if ((type !== "ceramic" && type !== "ebook" && type !== "seminar") ||
          typeof id !== "number" || !Number.isSafeInteger(id) || id < 1 || id > maxQuantity ||
          typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1) continue;

      const key = cartKey({ type, id });
      const previous = items.get(key)?.quantity ?? 0;
      items.set(key, { type, id, quantity: type === "ceramic" ? Math.min(maxQuantity, previous + quantity) : 1 });
    }
    return [...items.values()];
  } catch {
    return [];
  }
}

type CartState = {
  ready: boolean;
  storageUnavailable: boolean;
  items: CartItem[];
  count: number;
  quantityOf: (reference: CartReference) => number;
  add: (reference: CartReference, quantity: number, limit: number) => boolean;
  update: (reference: CartReference, quantity: number, limit: number) => void;
  remove: (reference: CartReference) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const current = useRef<CartItem[]>([]);

  useEffect(() => {
    function load(raw: string | null) {
      current.current = readItems(raw);
      setItems(current.current);
    }
    try {
      load(window.localStorage.getItem(storageKey));
    } catch {
      setStorageUnavailable(true);
    }
    setReady(true);

    function sync(event: StorageEvent) {
      if (event.storageArea === window.localStorage && (event.key === storageKey || event.key === null)) {
        load(event.newValue);
      }
    }

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function save(next: CartItem[]) {
    current.current = next;
    setItems(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ items: next }));
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
  }

  function add(reference: CartReference, quantity: number, limit: number) {
    const key = cartKey(reference);
    const prior = current.current.find((item) => cartKey(item) === key);
    const total = (prior?.quantity ?? 0) + quantity;
    const maximum = reference.type === "ceramic" ? limit : Math.min(1, limit);
    if (!ready || !Number.isSafeInteger(quantity) || quantity < 1 || total > maximum) return false;

    save(prior
      ? current.current.map((item) => cartKey(item) === key ? { ...item, quantity: total } : item)
      : [...current.current, { ...reference, quantity }]);
    return true;
  }

  function update(reference: CartReference, quantity: number, limit: number) {
    if (!ready || reference.type !== "ceramic" || !Number.isInteger(quantity) || quantity < 1 || quantity > limit) return;
    const key = cartKey(reference);
    save(current.current.map((item) => cartKey(item) === key ? { ...item, quantity } : item));
  }

  return (
    <CartContext.Provider value={{
      ready, storageUnavailable, items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      quantityOf: (reference) => items.find((item) => cartKey(item) === cartKey(reference))?.quantity ?? 0,
      add, update,
      remove: (reference) => save(current.current.filter((item) => cartKey(item) !== cartKey(reference))),
      clear: () => save([]),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider is required");
  return cart;
}
