import { api, toApiError } from "./_axios-client";

export type EbooksGetDto = {
  id: number;
  title: string;
  author?: string | null;
  description?: string | null;
  tableOfContents: string;

  coverImageAssetId?: number | null;
  coverImageUrl?: string | null;
  coverImageAltText?: string | null;

  price: number;

  pdfAssetId?: number | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;

  publishedAt: string;
};

export type EbooksPostDto = {
  title: string;
  author?: string | null;
  description?: string | null;
  tableOfContents: string;
  price: number;
  publishedAt: string;

  coverImageFile?: File | null;
  coverImageAssetId?: number | null;

  file?: File | null;
  pdfAssetId?: number | null;
};

const base = "/Ebooks";

function buildFormData(payload: EbooksPostDto): FormData {
  const fd = new FormData();

  fd.append("Title", payload.title);
  fd.append("Author", payload.author ?? "");
  fd.append("Description", payload.description ?? "");
  fd.append("TableOfContents", payload.tableOfContents);
  fd.append("Price", String(payload.price));
  fd.append("PublishedAt", payload.publishedAt);

  if (payload.coverImageFile) {
    fd.append("CoverImageFile", payload.coverImageFile);
  } else if (
    payload.coverImageAssetId !== undefined &&
    payload.coverImageAssetId !== null
  ) {
    fd.append(
      "CoverImageAssetId",
      String(payload.coverImageAssetId)
    );
  }

  if (payload.file) {
    fd.append("File", payload.file);
  } else if (
    payload.pdfAssetId !== undefined &&
    payload.pdfAssetId !== null
  ) {
    fd.append("PdfAssetId", String(payload.pdfAssetId));
  }

  return fd;
}

export const EbooksApi = {
  async list(): Promise<EbooksGetDto[]> {
    try {
      const { data } = await api.get(base);

      return Array.isArray(data) ? data : data ? [data] : [];
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

  async create(
    payload: EbooksPostDto
  ): Promise<EbooksGetDto> {
    try {
      const formData = buildFormData(payload);

      const { data } = await api.post(base, formData);

      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(
    id: number,
    payload: EbooksPostDto
  ): Promise<void> {
    try {
      const formData = buildFormData(payload);

      await api.put(`${base}/${id}`, formData);
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
  },
};