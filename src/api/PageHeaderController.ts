import { api, toApiError } from "./_axios-client";

export type PageHeaderGetDto = {
  id: number;
  pageKey: string;
  title: string;
  description: string;
};

export type PageHeaderPutDto = {
  title: string;
  description: string;
};

const base = "/PageHeader";

export const PageHeaderApi = {
  async list(): Promise<PageHeaderGetDto[]> {
    try {
      const { data } = await api.get<PageHeaderGetDto[]>(base);
      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async get(pageKey: string): Promise<PageHeaderGetDto> {
    try {
      const encodedPageKey = encodeURIComponent(pageKey);

      const { data } = await api.get<PageHeaderGetDto>(
        `${base}/${encodedPageKey}`,
      );

      return data;
    } catch (error) {
      throw toApiError(error);
    }
  },

  async update(
    pageKey: string,
    dto: PageHeaderPutDto,
  ): Promise<void> {
    try {
      const encodedPageKey = encodeURIComponent(pageKey);

      await api.put(`${base}/${encodedPageKey}`, dto);
    } catch (error) {
      throw toApiError(error);
    }
  },
};