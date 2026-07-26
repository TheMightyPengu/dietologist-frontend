import { api, toApiError } from "./_axios-client";

export type SeminarMode = "create" | "edit";

export type Seminar = {
  id: number;
  title: string;
  description: string;
  content: string;

  imageAssetId?: number | null;
  imageUrl?: string | null;
  imageAltText?: string | null;

  price: number;
  duration: number;
  dateTime: string;
  type: string;
};

export type SeminarPayload = {
  title: string;
  description: string;
  content: string;

  imageFile?: File | null;
  imageAssetId?: number | null;

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

    imageAssetId:
      d?.imageAssetId !== undefined && d?.imageAssetId !== null
        ? Number(d.imageAssetId)
        : d?.ImageAssetId !== undefined && d?.ImageAssetId !== null
          ? Number(d.ImageAssetId)
          : null,

    imageUrl:
      d?.imageUrl !== undefined && d?.imageUrl !== null
        ? String(d.imageUrl)
        : d?.ImageUrl !== undefined && d?.ImageUrl !== null
          ? String(d.ImageUrl)
          : null,

    imageAltText:
      d?.imageAltText !== undefined && d?.imageAltText !== null
        ? String(d.imageAltText)
        : d?.ImageAltText !== undefined && d?.ImageAltText !== null
          ? String(d.ImageAltText)
          : null,

    price: Number(d?.price ?? d?.Price ?? 0),
    duration: Number(d?.duration ?? d?.Duration ?? 0),
    dateTime: String(d?.dateTime ?? d?.DateTime ?? ""),
    type: String(d?.type ?? d?.Type ?? ""),
  };
}

function buildFormData(payload: SeminarPayload): FormData {
  const fd = new FormData();

  fd.append("Title", payload.title);
  fd.append("Description", payload.description);
  fd.append("Content", payload.content);
  fd.append("Price", String(payload.price));
  fd.append("Duration", String(payload.duration));
  fd.append("DateTime", payload.dateTime);
  fd.append("Type", payload.type);

  if (payload.imageFile) {
    fd.append("ImageFile", payload.imageFile);
  } else if (
    payload.imageAssetId !== undefined &&
    payload.imageAssetId !== null
  ) {
    fd.append("ImageAssetId", String(payload.imageAssetId));
  }

  return fd;
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
    const fd = buildFormData(payload);

    const { data } = await api.post(base, fd);

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
    const fd = buildFormData(payload);

    await api.put(`${base}/${id}`, fd);
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