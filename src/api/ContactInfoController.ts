import { api, toApiError } from './_axios-client';

export type ContactInfoGetDto = {
  id: number;
  email: string;
  telephone: string;
  location: string;
};

export type ContactInfoPostDto = {
  email: string;
  telephone: string;
  location: string;
};

const base = '/ContactInfo';

export const ContactInfoApi = {
  async list(): Promise<ContactInfoGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<ContactInfoGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: ContactInfoPostDto): Promise<ContactInfoGetDto> {
    try {
      const { data } = await api.post(base, payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: ContactInfoPostDto): Promise<void> {
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