export type ServiceCategory = "individual" | "group";

export type ServiceChip = { id: string; label: string; value: string };
export type Service = {
  id: string;
  category: ServiceCategory;
  title: string;
  intro?: string;          // small paragraph above points
  points: string[];        // numbered/bulleted items
  chips: ServiceChip[];    // pill-like meta (label + value)
};

const KEY = "api:services";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/** Seed with one example of each (based on your screenshots) */
const DEFAULT_SERVICES: Service[] = [
  {
    id: "svc-1",
    category: "individual",
    title: "Συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης",
    intro: undefined,
    points: [
      "Ανάλυση σύστασης σώματος (λιπομέτρηση) — αν επιθυμείτε.",
      "Ιατρικό και φαρμακευτικό ιστορικό.",
      "Ιστορικό σωματικού βάρους.",
      "Διατροφικό ιστορικό & καθημερινότητα.",
      "Καθορισμός στόχων.",
      "Σχεδιασμός εξατομικευμένου προγράμματος.",
      "Επόμενες συνεδρίες (ανά 1–2 εβδομάδες): αξιολόγηση στόχων, δυσκολίες, αναπροσαρμογές, εκπαίδευση.",
    ],
    chips: [
      { id: "c1", label: "Διάρκεια 1ης συνάντησης", value: "60’" },
      { id: "c2", label: "Κόστος 1ης συνάντησης", value: "50€ (με ΦΠΑ)" },
      { id: "c3", label: "Επόμενες συναντήσεις", value: "45’" },
      { id: "c4", label: "Κόστος επόμενων", value: "40€ (με ΦΠΑ)" },
    ],
  },
  {
    id: "svc-2",
    category: "group",
    title: "Ομαδικές συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης",
    intro:
      "Σταδιακή εκπαίδευση στον τρόπο διατροφής που ταιριάζει στις ανάγκες σας με αλληλεπίδραση σε μικρές ομάδες.",
    points: [
      "Γνωριμία με το σώμα μας",
      "Διατροφική εκπαίδευση & βασικές στρατηγικές",
      "Ανάγνωση ετικετών τροφίμων",
      "Οργάνωση γευμάτων (meal prep)",
      "Αναγνώριση συναισθηματικού φαγητού & μοτίβων",
      "Διαχείριση υποτροπών & κοινωνικής πίεσης",
      "Άσκηση για αποδοχή σώματος & ενίσχυση αυτοεκτίμησης",
    ],
    chips: [
      { id: "g1", label: "Αριθμός συμμετεχόντων", value: "4–6" },
      { id: "g2", label: "Έναρξη", value: "Οκτώβριος 2025" },
      { id: "g3", label: "Διάρκεια", value: "120’/συνάντηση" },
      { id: "g4", label: "Συχνότητα", value: "2 φορές/μήνα" },
      { id: "g5", label: "Αριθμός συναντήσεων", value: "10" },
      { id: "g6", label: "Κόστος/συνάντηση", value: "25€ (με ΦΠΑ)" },
    ],
  },
];

function readLS(): Service[] {
  if (typeof window === "undefined") return DEFAULT_SERVICES;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Service[]) : DEFAULT_SERVICES;
  } catch {
    return DEFAULT_SERVICES;
  }
}
function writeLS(all: Service[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(all));
  }
}

/** API-like functions (swap to real fetch later without touching UI) */
export async function fetchServices(): Promise<Service[]> {
  await delay(300);
  return readLS();
}

export async function createService(
  input: Omit<Service, "id">
): Promise<Service> {
  await delay(300);
  const all = readLS();
  const id = `svc-${Date.now().toString(36)}`;
  const svc: Service = { id, ...input };
  all.push(svc);
  writeLS(all);
  return svc;
}

export async function updateService(input: Service): Promise<Service> {
  await delay(300);
  const all = readLS();
  const idx = all.findIndex(s => s.id === input.id);
  if (idx !== -1) all[idx] = input;
  writeLS(all);
  return input;
}

export async function deleteService(id: string): Promise<void> {
  await delay(300);
  const all = readLS().filter(s => s.id !== id);
  writeLS(all);
}
