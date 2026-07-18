import { api, toApiError } from "./_axios-client";

export type AppointmentStatus = 0 | 1 | 2 | 3;

export type ProvidedServices = {
  id: number;
  category: string;
  title: string;
  duration: number;
  description: string;
  priceIncludingVAT: number;
  interval?: number;
};

export type AppointmentsGetDto = {
  id: number;
  providedServiceId?: number;
  serviceId?: number;
  providedService?: ProvidedServices | null;
  appointmentDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status?: AppointmentStatus;
  message?: string | null;
};

export type AppointmentsPostDto = {
  providedServiceId: number;
  appointmentDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string | null;
};

export type AppointmentStatusPutDto = {
  status: AppointmentStatus;
};

const base = "/Appointments";

function toIsoDateOnly(input?: string | Date) {
  if (!input) return undefined;
  if (typeof input === "string") return input.slice(0, 10);

  const y = input.getFullYear();
  const m = String(input.getMonth() + 1).padStart(2, "0");
  const d = String(input.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeAvailableDates(data: unknown): string[] {
  if (!Array.isArray(data)) return [];

  const out = data
    .map((item) => {
      if (typeof item === "string") return item.slice(0, 10);

      if (item && typeof item === "object") {
        const maybe =
          (item as Record<string, unknown>).date ??
          (item as Record<string, unknown>).availableDate ??
          (item as Record<string, unknown>).appointmentDate ??
          (item as Record<string, unknown>).value;

        if (typeof maybe === "string") return maybe.slice(0, 10);
      }

      return null;
    })
    .filter((v): v is string => Boolean(v));

  return Array.from(new Set(out)).sort();
}

function normalizeTimeToHHMM(value: string) {
  return value.slice(0, 5);
}

function extractAthensTime(value: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function normalizeAvailableSlots(data: unknown): string[] {
  if (!Array.isArray(data)) return [];

  const out = data
    .map((item) => {
      if (typeof item === "string") {
        if (item.includes("T")) {
          return extractAthensTime(item);
        }

        if (/^\d{2}:\d{2}/.test(item)) {
          return normalizeTimeToHHMM(item);
        }

        return null;
      }

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;

        const maybeTime =
          record.time ??
          record.slot ??
          record.value ??
          record.startTime ??
          record.startAt;

        if (typeof maybeTime !== "string") {
          return null;
        }

        if (maybeTime.includes("T")) {
          return extractAthensTime(maybeTime);
        }

        if (/^\d{2}:\d{2}/.test(maybeTime)) {
          return normalizeTimeToHHMM(maybeTime);
        }
      }

      return null;
    })
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(out)).sort((a, b) => a.localeCompare(b));
}

export const AppointmentsApi = {
  async list(): Promise<AppointmentsGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<AppointmentsGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: AppointmentsPostDto): Promise<AppointmentsGetDto> {
    try {
      const { data } = await api.post(base, payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: AppointmentsPostDto): Promise<void> {
    try {
      await api.put(`${base}/${id}`, payload);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${base}/${id}`);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getAvailableDates(params?: {
    fromDate?: string | Date;
    daysAhead?: number;
  }): Promise<string[]> {
    try {
      const { data } = await api.get(`${base}/available-dates`, {
        params: {
          fromDate: toIsoDateOnly(params?.fromDate),
          daysAhead: params?.daysAhead ?? 30,
        },
      });

      return normalizeAvailableDates(data);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getAvailableSlots(date: string | Date): Promise<string[]> {
    try {
      const { data } = await api.get(`${base}/available-slots`, {
        params: {
          date: toIsoDateOnly(date),
        },
      });

      return normalizeAvailableSlots(data);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async updateStatus(id: number, payload: AppointmentStatusPutDto): Promise<void> {
    try {
      await api.put(`${base}/${id}/status`, payload);
    } catch (e) {
      throw toApiError(e);
    }
  },
};