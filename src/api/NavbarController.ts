import { api, toApiError } from "./_axios-client";

export type NavbarGetDto = {
  id: number;
  title: string;
  titleEn?: string | null;
  imageUrl: string;
  imageAltText?: string | null;
  imageAltTextEn?: string | null;
};

export type NavbarPostDto = {
  title: string;
  titleEn?: string | null;
  imageFile?: File;
};

const base = "/Navbar";

function normalizeNavbar(data: unknown): NavbarGetDto | null {
  if (!data) return null;

  const item = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;

  if (!item) return null;

  return {
    id: Number(item.id ?? item.Id ?? 1),
    title: String(item.title ?? item.Title ?? ""),
    titleEn: item.titleEn != null ? String(item.titleEn) : item.TitleEn != null ? String(item.TitleEn) : null,
    imageUrl: String(item.imageUrl ?? item.ImageUrl ?? ""),
    imageAltText: item.imageAltText != null ? String(item.imageAltText) : item.ImageAltText != null ? String(item.ImageAltText) : null,
    imageAltTextEn: item.imageAltTextEn != null ? String(item.imageAltTextEn) : item.ImageAltTextEn != null ? String(item.ImageAltTextEn) : null,
  };
}

function buildFormData(payload: NavbarPostDto) {
  const formData = new FormData();

  formData.append("Title", payload.title);
  formData.append("TitleEn", payload.titleEn ?? "");

  if (payload.imageFile) {
    formData.append("ImageFile", payload.imageFile);
  }

  return formData;
}

export const NavbarApi = {
  async list(): Promise<NavbarGetDto[]> {
    try {
      const { data } = await api.get(base);

      if (Array.isArray(data)) {
        return data
          .map((item) => normalizeNavbar(item))
          .filter(Boolean) as NavbarGetDto[];
      }

      const item = normalizeNavbar(data);
      return item ? [item] : [];
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getSingle(): Promise<NavbarGetDto | null> {
    try {
      const { data } = await api.get(base);
      return normalizeNavbar(data);
    } catch {
      return null;
    }
  },

  async update(id: number, payload: NavbarPostDto): Promise<void> {
    try {
      await api.put(`${base}/${id}`, buildFormData(payload), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (e) {
      throw toApiError(e);
    }
  },
};

export default NavbarApi;
