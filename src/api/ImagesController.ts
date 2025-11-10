import { api, toApiError } from './_axios-client';

export type ImagesGetDto = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  uploadedAt: string;
};

export type ImagesPostDto = {
  title: string;
  description: string;
  imageUrl?: string | null;
  uploadedAt: string;
  imageFile?: File | null;
};

const base = '/Images';

function buildFormData(p: ImagesPostDto): FormData {
  const fd = new FormData();
  fd.append('Title', p.title);
  fd.append('Description', p.description);
  if (p.imageUrl ?? null) fd.append('ImageUrl', String(p.imageUrl));
  fd.append('UploadedAt', p.uploadedAt);
  if (p.imageFile) fd.append('ImageFile', p.imageFile);
  return fd;
}

export const ImagesApi = {
  async list(): Promise<ImagesGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<ImagesGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: ImagesPostDto): Promise<ImagesGetDto> {
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

  async update(id: number, payload: ImagesPostDto): Promise<void> {
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