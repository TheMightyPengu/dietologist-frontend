import { api, toApiError } from './_axios-client';

export type MainPageGetDto = {
  id: number;
  title: string;
  info: string;
  biography: string;
  phylosophy: string;
  mainPictureId?: number | null;
  mainPictureUrl?: string | null;
  mainPictureAltText?: string | null;
  bioPictureId?: number | null;
  bioPictureUrl?: string | null;
  bioPictureAltText?: string | null;
  mainSmallPicture1Id?: number | null;
  mainSmallPicture1Url?: string | null;
  mainSmallPicture1AltText?: string | null;
  mainSmallPicture2Id?: number | null;
  mainSmallPicture2Url?: string | null;
  mainSmallPicture2AltText?: string | null;
  mainSmallPicture3Id?: number | null;
  mainSmallPicture3Url?: string | null;
  mainSmallPicture3AltText?: string | null;
  smallCardsSectionTitle?: string | null;
  smallCard1Title?: string | null;
  smallCard1Text?: string | null;
  smallCard2Title?: string | null;
  smallCard2Text?: string | null;
  smallCard3Title?: string | null;
  smallCard3Text?: string | null;
};

export type MainPagePostDto = {
  title: string;
  info: string;
  biography: string;
  phylosophy: string;
  mainPicture?: File | null;
  mainPictureId?: number | null;
  bioPicture?: File | null;
  bioPictureId?: number | null;
  mainSmallPicture1?: File | null;
  mainSmallPicture1Id?: number | null;
  mainSmallPicture2?: File | null;
  mainSmallPicture2Id?: number | null;
  mainSmallPicture3?: File | null;
  mainSmallPicture3Id?: number | null;
  smallCardsSectionTitle?: string | null;
  smallCard1Title?: string | null;
  smallCard1Text?: string | null;
  smallCard2Title?: string | null;
  smallCard2Text?: string | null;
  smallCard3Title?: string | null;
  smallCard3Text?: string | null;
};

const base = '/MainPages';

function buildFormData(p: MainPagePostDto): FormData {
  const fd = new FormData();

  fd.append("Title", p.title);
  fd.append("Info", p.info);
  fd.append("Biography", p.biography);
  fd.append("Phylosophy", p.phylosophy);
  fd.append("SmallCardsSectionTitle", p.smallCardsSectionTitle ?? "");
  fd.append("SmallCard1Title", p.smallCard1Title ?? "");
  fd.append("SmallCard1Text", p.smallCard1Text ?? "");
  fd.append("SmallCard2Title", p.smallCard2Title ?? "");
  fd.append("SmallCard2Text", p.smallCard2Text ?? "");
  fd.append("SmallCard3Title", p.smallCard3Title ?? "");
  fd.append("SmallCard3Text", p.smallCard3Text ?? "");

  if (p.mainPicture) {
    fd.append("MainPicture", p.mainPicture);
  } else if (p.mainPictureId !== undefined && p.mainPictureId !== null) {
    fd.append("MainPictureId", String(p.mainPictureId));
  }

  if (p.bioPicture) {
    fd.append("BioPicture", p.bioPicture);
  } else if (p.bioPictureId !== undefined && p.bioPictureId !== null) {
    fd.append("BioPictureId", String(p.bioPictureId));
  }

  if (p.mainSmallPicture1) {
    fd.append("MainSmallPicture1", p.mainSmallPicture1);
  } else if (
    p.mainSmallPicture1Id !== undefined &&
    p.mainSmallPicture1Id !== null
  ) {
    fd.append("MainSmallPicture1Id", String(p.mainSmallPicture1Id));
  }

  if (p.mainSmallPicture2) {
    fd.append("MainSmallPicture2", p.mainSmallPicture2);
  } else if (
    p.mainSmallPicture2Id !== undefined &&
    p.mainSmallPicture2Id !== null
  ) {
    fd.append("MainSmallPicture2Id", String(p.mainSmallPicture2Id));
  }

  if (p.mainSmallPicture3) {
    fd.append("MainSmallPicture3", p.mainSmallPicture3);
  } else if (
    p.mainSmallPicture3Id !== undefined &&
    p.mainSmallPicture3Id !== null
  ) {
    fd.append("MainSmallPicture3Id", String(p.mainSmallPicture3Id));
  }

  return fd;
}

export const MainPagesApi = {
  async list(): Promise<MainPageGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<MainPageGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async getMainPictureUrl(id: number): Promise<{ url: string }> {
    try {
      const { data } = await api.get(`${base}/${id}/main-picture-url`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: MainPagePostDto): Promise<MainPageGetDto> {
    try {
      const fd = buildFormData(payload);
      const { data } = await api.post(base, fd);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: MainPagePostDto): Promise<void> {
    try {
      const fd = buildFormData(payload);
      await api.put(`${base}/${id}`, fd);
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