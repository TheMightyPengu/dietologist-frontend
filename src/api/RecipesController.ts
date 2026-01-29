import { api, toApiError } from './_axios-client';

export type RecipesGetDto = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string; // ISO
};

export type RecipesPostDto = {
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string; // ISO
  imageFile?: File | null;
};

const base = '/Recipes';

function buildFormData(p: RecipesPostDto): FormData {
  const fd = new FormData();
  // Use backend DTO property names (model binding is case-insensitive, but we keep them identical)
  fd.append('Title', p.title);
  fd.append('Description', p.description);
  if (p.imageUrl ?? null) fd.append('ImageUrl', String(p.imageUrl));
  fd.append('CreatedAt', p.createdAt);
  if (p.imageFile) fd.append('ImageFile', p.imageFile);
  return fd;
}

export const RecipesApi = {
  async list(): Promise<RecipesGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<RecipesGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: RecipesPostDto): Promise<RecipesGetDto> {
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

  async update(id: number, payload: RecipesPostDto): Promise<void> {
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