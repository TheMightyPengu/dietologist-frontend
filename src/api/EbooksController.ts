import { api, toApiError } from './_axios-client';

export type EbooksGetDto = {
  id: number;
  title: string;
  author: string;
  tableOfContents: string;
  coverImageUrl: string;
  price: number;
  fileUrl?: string | null;
  publishedAt: string; // ISO
};

export type EbooksPostDto = {
  title: string;
  author: string;
  tableOfContents: string;
  coverImageUrl: string;
  price: number;
  fileUrl?: string | null;
  publishedAt: string; // ISO
  file?: File | null;  // corresponds to IFormFile
};

const base = '/Ebooks';

function buildFormData(p: EbooksPostDto): FormData {
  const fd = new FormData();
  fd.append('Title', p.title);
  fd.append('Author', p.author);
  fd.append('TableOfContents', p.tableOfContents);
  fd.append('CoverImageUrl', p.coverImageUrl);
  fd.append('Price', String(p.price));
  if (p.fileUrl ?? null) fd.append('FileUrl', String(p.fileUrl));
  fd.append('PublishedAt', p.publishedAt);
  if (p.file) fd.append('File', p.file);
  return fd;
}

export const EbooksApi = {
  async list(): Promise<EbooksGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<EbooksGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: EbooksPostDto): Promise<EbooksGetDto> {
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

  async update(id: number, payload: EbooksPostDto): Promise<void> {
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