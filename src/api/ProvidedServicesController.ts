import { api, toApiError } from './_axios-client';

export type ProvidedServicesGetDto = {
  id: number;
  category: string;
  duration: number;
  title: string;
  description: string;
  priceIncludingVAT: number;
  imageUrl: string;
};

export type ProvidedServicesPostDto = {
  category: string;
  duration: number;
  title: string;
  description: string;
  priceIncludingVAT: number;
  imageUrl: string;
};

const base = '/ProvidedServices';

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

  async create(payload: ProvidedServicesPostDto): Promise<ProvidedServicesGetDto> {
    try {
      const { data } = await api.post(base, payload);
      return data;
    } catch (e: unknown) {
      console.log("POST payload:", payload);
      console.log("Backend error:", e);
      throw toApiError(e);
    }
  },

  async update(id: number, payload: ProvidedServicesPostDto): Promise<void> {
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
  }
};
