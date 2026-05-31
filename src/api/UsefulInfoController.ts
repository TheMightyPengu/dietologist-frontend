import { api, toApiError } from "./_axios-client";

export type UsefulInfoGetDto = {
  id: number;
  title: string;
  info: string;
};

export type UsefulInfoPostDto = {
  title: string;
  info: string;
};

const base = "/UsefulInfo";

export const UsefulInfoApi = {
  async list(): Promise<UsefulInfoGetDto[]> {
    try {
      const { data } = await api.get(base);
      return Array.isArray(data) ? data : [data];
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<UsefulInfoGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getSingle(): Promise<UsefulInfoGetDto | null> {
    try {
      const { data } = await api.get(base);

      if (Array.isArray(data)) {
        return data[0] ?? null;
      }

      return data ?? null;
    } catch {
      try {
        return await this.get(1);
      } catch {
        return null;
      }
    }
  },

  async update(
    id: number,
    payload: UsefulInfoPostDto
  ): Promise<UsefulInfoGetDto> {
    try {
      const { data } = await api.put(`${base}/${id}`, payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async updateSingle(payload: UsefulInfoPostDto): Promise<UsefulInfoGetDto> {
    return this.update(1, payload);
  },
};