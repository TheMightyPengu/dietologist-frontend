import { api, toApiError } from './_axios-client';

export type ArticlesGetDto = {
  id: number;
  title: string;
  subtitle: string;
  heading: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string; // ISO
};

export type ArticlesPostDto = {
  title: string;
  subtitle: string;
  heading: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string; // ISO
  imageFile?: File | null;
};

const base = '/Articles';

function buildFormData(p: ArticlesPostDto): FormData {
  const fd = new FormData();
  fd.append('Title', p.title);
  fd.append('Subtitle', p.subtitle);
  fd.append('Heading', p.heading);
  fd.append('Content', p.content);
  if (p.imageUrl ?? null) fd.append('ImageUrl', String(p.imageUrl));
  fd.append('PublishedAt', p.publishedAt);
  if (p.imageFile) fd.append('ImageFile', p.imageFile);
  return fd;
}

export const ArticlesApi = {
  async list(): Promise<ArticlesGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<ArticlesGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: ArticlesPostDto): Promise<ArticlesGetDto> {
    try {
      const formData = buildFormData(payload);
      const { data } = await api.post(base, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: ArticlesPostDto): Promise<void> {
    try {
      const formData = buildFormData(payload);
      await api.put(`${base}/${id}`, formData, {
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