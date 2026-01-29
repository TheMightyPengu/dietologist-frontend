import { api, toApiError } from './_axios-client';

export type ContactMessagesGetDto = {
  id: number;
  senderName: string;
  senderEmail: string;
  message: string;
  sentAt: string; // ISO
};

export type ContactMessagesPostDto = {
  senderName: string;
  senderEmail: string;
  message: string;
  sentAt: string; // ISO
};

const base = '/ContactMessages';

export const ContactMessagesApi = {
  async list(): Promise<ContactMessagesGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<ContactMessagesGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: ContactMessagesPostDto): Promise<ContactMessagesGetDto> {
    try {
      const { data } = await api.post(base, payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: ContactMessagesPostDto): Promise<void> {
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