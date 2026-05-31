import { api, toApiError } from "./_axios-client";

export type NavbarGetDto = {
  id: number;
  title: string;
  imageUrl: string;
};

export type NavbarPostDto = {
  title: string;
  imageUrl: string;
};

const base = "/Navbar";

function normalizeNavbar(data: any): NavbarGetDto | null {
  if (!data) return null;

  const item = Array.isArray(data) ? data[0] : data;

  if (!item) return null;

  return {
    id: Number(item.id ?? item.Id ?? 1),
    title: String(item.title ?? item.Title ?? ""),
    imageUrl: String(item.imageUrl ?? item.ImageUrl ?? ""),
  };
}

function buildFormData(payload: NavbarPostDto) {
  const formData = new FormData();

  formData.append("Title", payload.title);
  formData.append("ImageUrl", payload.imageUrl);

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