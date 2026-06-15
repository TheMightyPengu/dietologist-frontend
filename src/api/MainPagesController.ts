import { api, toApiError } from './_axios-client';

export type MainPageGetDto = {
  id: number;
  title: string;
  info: string;
  biography: string;
  phylosophy: string;
  mainPictureId?: number | null;
  mainPictureUrl?: string | null;
  mainPictureAltText?: string | null;
};

export type MainPagePostDto = {
  title: string;
  info: string;
  biography: string;
  phylosophy: string;
  mainPicture?: File | null;
  mainPictureId?: number | null;
};

const base = '/MainPages';

function buildFormData(p: MainPagePostDto): FormData {
  const fd = new FormData();

  fd.append("Title", p.title);
  fd.append("Info", p.info);
  fd.append("Biography", p.biography);
  fd.append("Phylosophy", p.phylosophy);

  if (p.mainPicture) {
    fd.append("MainPicture", p.mainPicture);
  }

  if (p.mainPictureId !== undefined && p.mainPictureId !== null) {
    fd.append("MainPictureId", String(p.mainPictureId));
  }

  return fd;
}

export const MainPagesApi = {
  async list(): Promise<MainPageGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<MainPageGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getMainPictureUrl(id: number): Promise<{ url: string }> {
    try {
      const { data } = await api.get(`${base}/${id}/main-picture-url`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: MainPagePostDto): Promise<MainPageGetDto> {
    try {
      const fd = buildFormData(payload);
      const { data } = await api.post(base, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: MainPagePostDto): Promise<void> {
    try {
      const fd = buildFormData(payload);
      await api.put(`${base}/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
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
  }
};