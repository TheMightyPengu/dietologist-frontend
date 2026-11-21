import { api, toApiError } from './_axios-client';

export type ArticlesGetDto = {
  id: number;
  title: string;
  titleEn?: string | null;
  subtitle: string;
  subtitleEn?: string | null;
  heading: string;
  headingEn?: string | null;
  content: string;
  contentEn?: string | null;
  category?: string | null;
  categoryEn?: string | null;
  imageAltText?: string | null;
  imageAltTextEn?: string | null;
  imageUrl?: string | null;
  publishedAt: string; // ISO
};

export type ArticlesPostDto = {
  title: string;
  titleEn?: string | null;
  subtitle: string;
  subtitleEn?: string | null;
  heading: string;
  headingEn?: string | null;
  content: string;
  contentEn?: string | null;
  publishedAt: string; // ISO
  category: string;
  categoryEn?: string | null;
  imageFile?: File | null;
};

const base = '/Articles';

function buildFormData(p: ArticlesPostDto): FormData {
  const fd = new FormData();
  fd.append('Title', p.title);
  fd.append('TitleEn', p.titleEn ?? '');
  fd.append('Subtitle', p.subtitle);
  fd.append('SubtitleEn', p.subtitleEn ?? '');
  fd.append('Heading', p.heading);
  fd.append('HeadingEn', p.headingEn ?? '');
  fd.append('Content', p.content);
  fd.append('ContentEn', p.contentEn ?? '');
  fd.append('PublishedAt', p.publishedAt);
  fd.append('Category', p.category);
  fd.append('CategoryEn', p.categoryEn ?? '');
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
