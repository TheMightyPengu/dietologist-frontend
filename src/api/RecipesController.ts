import { api, toApiError } from './_axios-client';

export type RecipesGetDto = {
  id: number;
  title: string;
  titleEn?: string | null;
  ingredients: string;
  ingredientsEn?: string | null;
  category: string;
  categoryEn?: string | null;
  instructions: string;
  instructionsEn?: string | null;
  timeToPrepare: number;
  description: string;
  descriptionEn?: string | null;
  imageAltText?: string | null;
  imageAltTextEn?: string | null;
  imageUrl?: string | null;
  createdAt: string; // ISO
};

export type RecipesPostDto = {
  title: string;
  titleEn?: string | null;
  ingredients: string;
  ingredientsEn?: string | null;
  category: string;
  categoryEn?: string | null;
  instructions: string;
  instructionsEn?: string | null;
  timeToPrepare: number;
  description: string;
  descriptionEn?: string | null;
  createdAt: string; // ISO
  imageFile?: File | null;
};

const base = '/Recipes';

function buildFormData(p: RecipesPostDto): FormData {
  const fd = new FormData();

  fd.append('Title', p.title);
  fd.append('TitleEn', p.titleEn ?? '');
  fd.append('Ingredients', p.ingredients);
  fd.append('IngredientsEn', p.ingredientsEn ?? '');
  fd.append('Category', p.category);
  fd.append('CategoryEn', p.categoryEn ?? '');
  fd.append('Instructions', p.instructions);
  fd.append('InstructionsEn', p.instructionsEn ?? '');
  fd.append('TimeToPrepare', String(p.timeToPrepare));
  fd.append('Description', p.description);
  fd.append('DescriptionEn', p.descriptionEn ?? '');

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
