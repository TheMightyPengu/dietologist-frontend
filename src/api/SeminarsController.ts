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

function normalizeSeminar(data: any): Seminar {
  return {
    id: Number(data?.id ?? data?.Id ?? 0),
    title: String(data?.title ?? data?.Title ?? ""),
    description: String(data?.description ?? data?.Description ?? ""),
    content: String(data?.content ?? data?.Content ?? ""),
    imageUrl: String(data?.imageUrl ?? data?.ImageUrl ?? ""),
    price: Number(data?.price ?? data?.Price ?? 0),
    duration: Number(data?.duration ?? data?.Duration ?? 0),
    dateTime: String(data?.dateTime ?? data?.DateTime ?? ""),
    type: String(data?.type ?? data?.Type ?? ""),
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