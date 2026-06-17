import { api, toApiError } from "./_axios-client";

export type SeminarMode = "create" | "edit";

export type Seminar = {
  id: number;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  price: number;
  duration: number;
  dateTime: string;
  type: string;
};

export type SeminarPayload = {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  price: number;
  duration: number;
  dateTime: string;
  type: string;
};

const base = "/Seminars";

function normalizeSeminar(data: unknown): Seminar {
  const d = data as Record<string, unknown>;
  return {
    id: Number(d?.id ?? d?.Id ?? 0),
    title: String(d?.title ?? d?.Title ?? ""),
    description: String(d?.description ?? d?.Description ?? ""),
    content: String(d?.content ?? d?.Content ?? ""),
    imageUrl: String(d?.imageUrl ?? d?.ImageUrl ?? ""),
    price: Number(d?.price ?? d?.Price ?? 0),
    duration: Number(d?.duration ?? d?.Duration ?? 0),
    dateTime: String(d?.dateTime ?? d?.DateTime ?? ""),
    type: String(d?.type ?? d?.Type ?? ""),
  };
}

export async function getSeminars(): Promise<Seminar[]> {
  try {
    const { data } = await api.get(base);

    if (!Array.isArray(data)) {
      return data ? [normalizeSeminar(data)] : [];
    }

    return data.map(normalizeSeminar);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function getSeminarById(id: number): Promise<Seminar> {
  try {
    const { data } = await api.get(`${base}/${id}`);
    return normalizeSeminar(data);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function createSeminar(
  payload: SeminarPayload
): Promise<Seminar> {
  try {
    const { data } = await api.post(base, payload);
    return normalizeSeminar(data);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function updateSeminar(
  id: number,
  payload: SeminarPayload
): Promise<void> {
  try {
    await api.put(`${base}/${id}`, payload);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function deleteSeminar(id: number): Promise<void> {
  try {
    await api.delete(`${base}/${id}`);
  } catch (e) {
    throw toApiError(e);
  }
}

const SeminarsApi = {
  list: getSeminars,
  get: getSeminarById,
  create: createSeminar,
  update: updateSeminar,
  delete: deleteSeminar,
};

export default SeminarsApi;