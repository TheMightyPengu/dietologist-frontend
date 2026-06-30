import { api, toApiError } from "./_axios-client";

export type ProvidedServicesGetDto = {
  id: number;
  category: string;
  duration: number;
  title: string;
  description: string;
  priceIncludingVAT: number;
  imageAssetId?: number | null;
  imageUrl?: string | null;
  imageAltText?: string | null;
};

export type ProvidedServicesPostDto = {
  category: string;
  duration: number;
  title: string;
  description: string;
  priceIncludingVAT: number;
  imageFile?: File | null;
  imageAssetId?: number | null;
};

const base = "/ProvidedServices";

function buildFormData(payload: ProvidedServicesPostDto): FormData {
  const fd = new FormData();

  fd.append("Category", payload.category);
  fd.append("Duration", String(payload.duration));
  fd.append("Title", payload.title);
  fd.append("Description", payload.description);
  fd.append("PriceIncludingVAT", String(payload.priceIncludingVAT));

  if (payload.imageFile) {
    fd.append("ImageFile", payload.imageFile);
  } else if (payload.imageAssetId != null) {
    fd.append("ImageAssetId", String(payload.imageAssetId));
  }

  return fd;
}

export const ProvidedServicesApi = {
  async list(): Promise<ProvidedServicesGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<ProvidedServicesGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(
    payload: ProvidedServicesPostDto
  ): Promise<ProvidedServicesGetDto> {
    try {
      const formData = buildFormData(payload);

      const { data } = await api.post(base, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: ProvidedServicesPostDto): Promise<void> {
    try {
      const formData = buildFormData(payload);

      await api.put(`${base}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
};