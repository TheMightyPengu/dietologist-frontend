export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type Booking = {
  id: string;
  serviceId: string | null; // points to Services page item (optional link)
  serviceLabel: string;     // snapshot label shown in UI
  name: string;
  phone: string;
  email: string;
  dateISO: string;          // date part
  time: string;             // HH:MM (24h)
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type MessageSettings = {
  id: "settings";
  destinationEmail: string;
};

const KEY_BOOKINGS = "api:contact:bookings";
const KEY_SETTINGS = "api:contact:settings";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const SEED: Booking[] = [
  {
    id: "b-1",
    serviceId: "s-1",
    serviceLabel: "Ανάλυση σύστασης σώματος (1:1)",
    name: "Μαρία Παπαδοπούλου",
    phone: "6999999999",
    email: "maria@example.com",
    dateISO: "2025-11-18",
    time: "17:30",
    notes: "Προτιμώ απογευματινή ώρα.",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b-2",
    serviceId: "s-2",
    serviceLabel: "Ομαδικές συνεδρίες — Mindful Eating",
    name: "Γιώργος Ν.",
    phone: "6981111111",
    email: "george@example.com",
    dateISO: "2025-11-21",
    time: "10:00",
    notes: "",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS: MessageSettings = {
  id: "settings",
  destinationEmail: "hello@yourdomain.gr",
};

function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function setLS<T>(key: string, val: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}

/* -------- BOOKINGS -------- */
export async function fetchBookings(): Promise<Booking[]> {
  await delay(250);
  return getLS(KEY_BOOKINGS, SEED);
}
export async function createBooking(input: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
  await delay(250);
  const all = getLS(KEY_BOOKINGS, SEED);
  const row: Booking = {
    ...input,
    id: `b-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setLS(KEY_BOOKINGS, [row, ...all]);
  return row;
}
export async function updateBooking(input: Booking): Promise<Booking> {
  await delay(250);
  const all = getLS(KEY_BOOKINGS, SEED);
  const i = all.findIndex(b => b.id === input.id);
  if (i !== -1) all[i] = { ...input, updatedAt: new Date().toISOString() };
  setLS(KEY_BOOKINGS, all);
  return all[i];
}
export async function deleteBooking(id: string) {
  await delay(250);
  setLS(KEY_BOOKINGS, getLS(KEY_BOOKINGS, SEED).filter(b => b.id !== id));
}

/* -------- SETTINGS (Messages destination) -------- */
export async function fetchMessageSettings(): Promise<MessageSettings> {
  await delay(150);
  return getLS(KEY_SETTINGS, DEFAULT_SETTINGS);
}
export async function updateMessageSettings(s: MessageSettings): Promise<MessageSettings> {
  await delay(150);
  setLS(KEY_SETTINGS, s);
  return s;
}
