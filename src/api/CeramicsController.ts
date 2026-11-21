import { api } from "./_axios-client";

export type CeramicSort = "newest" | "price_asc" | "price_desc";

export type CeramicCategory = {
  id: number;
  name: string;
  nameEn?: string | null;
  slug: string;
  createdAt: string;
};

export type CeramicProductCard = {
  id: number;
  title: string;
  titleEn?: string | null;
  price: number;
  category: CeramicCategory;
  primaryImageUrl: string | null;
  createdAt: string;
};

export type CeramicImage = {
  id: number;
  productId: number;
  imageUrl: string;
  sortOrder: number;
};

export type CeramicProduct = Omit<CeramicProductCard, "primaryImageUrl"> & {
  description: string;
  descriptionEn?: string | null;
  images: CeramicImage[];
  updatedAt: string;
};

export type CeramicProductPage = {
  items: CeramicProductCard[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

type CategoryInput = Pick<CeramicCategory, "name" | "nameEn">;
export type CeramicProductInput = Pick<CeramicProduct, "title" | "titleEn" | "description" | "descriptionEn" | "price"> & {
  categoryId: number;
};
type ImageInput = Pick<CeramicImage, "imageUrl" | "sortOrder">;

const categories = "/Ceramics/categories";
const products = "/Ceramics/products";
const images = (productId: number) => `${products}/${productId}/images`;

export const CeramicsApi = {
  async categories(signal?: AbortSignal) {
    return (await api.get<CeramicCategory[]>(categories, { signal })).data;
  },
  async products(params: { category?: string; sort?: CeramicSort; page?: number; pageSize?: number }, signal?: AbortSignal) {
    return (await api.get<CeramicProductPage>(products, { params, signal })).data;
  },
  async product(id: number, signal?: AbortSignal) {
    return (await api.get<CeramicProduct>(`${products}/${id}`, { signal })).data;
  },
  async saveCategory(input: CategoryInput, id?: number) {
    if (id === undefined) await api.post(categories, input);
    else await api.put(`${categories}/${id}`, input);
  },
  async removeCategory(id: number) {
    await api.delete(`${categories}/${id}`);
  },
  async createProduct(input: CeramicProductInput) {
    return (await api.post<CeramicProduct>(products, input)).data;
  },
  async updateProduct(id: number, input: CeramicProductInput) {
    await api.put(`${products}/${id}`, input);
  },
  async removeProduct(id: number) {
    await api.delete(`${products}/${id}`);
  },
  async uploadImage(file: File) {
    const form = new FormData();
    form.append("File", file);
    form.append("MediaType", "Image");
    return (await api.post<{ publicUrl: string }>("/MediaAssets", form)).data.publicUrl;
  },
  async addImage(productId: number, input: ImageInput) {
    return (await api.post<CeramicImage>(images(productId), input)).data;
  },
  async updateImage(productId: number, imageId: number, input: ImageInput) {
    await api.put(`${images(productId)}/${imageId}`, input);
  },
  async removeImage(productId: number, imageId: number) {
    await api.delete(`${images(productId)}/${imageId}`);
  },
};
