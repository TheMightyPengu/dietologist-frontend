import { api, toApiError } from './_axios-client';

export type SocialMediaLinksGetDto = {
  id: string;
  platformName: string;
  url: string;
};

export type SocialMediaLinksPostDto = {
  platformName: string;
  url: string;
};

const base = '/SocialMediaLinks';

export const SocialMediaLinksApi = {
  async list(): Promise<SocialMediaLinksGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: string): Promise<SocialMediaLinksGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: SocialMediaLinksPostDto): Promise<SocialMediaLinksGetDto> {
    try {
      const { data } = await api.post(base, payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: string, payload: SocialMediaLinksPostDto): Promise<void> {
    try {
      await api.put(`${base}/${id}`, payload);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${base}/${id}`);
    } catch (e) {
      throw toApiError(e);
    }
  }
};