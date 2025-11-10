import { api, toApiError } from './_axios-client';

export type ResumeGetDto = {
  id: number;
  fileName: string;
  fileType?: string;
  data: string;
  uploadedAt: string;
};

export type ResumePostDto = {
  fileName: string;
  fileType?: string;
  uploadedAt?: string;
  file?: File;
};

const base = '/Resumes';

export const ResumesApi = {
  /** GET /api/Resumes */
  async list(): Promise<ResumeGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  /** GET /api/Resumes/{id} */
  async get(id: number): Promise<ResumeGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  /** POST /api/Resumes (multipart/form-data) */
  async create(payload: ResumePostDto): Promise<ResumeGetDto> {
    try {
      const formData = new FormData();
      formData.append('FileName', payload.fileName);
      if (payload.fileType) formData.append('FileType', payload.fileType);
      if (payload.uploadedAt) formData.append('UploadedAt', payload.uploadedAt);
      if (payload.file) formData.append('File', payload.file);

      const { data } = await api.post(base, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  /** PUT /api/Resumes/{id} (multipart/form-data) */
  async update(id: number, payload: ResumePostDto): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('FileName', payload.fileName);
      if (payload.fileType) formData.append('FileType', payload.fileType);
      if (payload.uploadedAt) formData.append('UploadedAt', payload.uploadedAt);
      if (payload.file) formData.append('File', payload.file);

      await api.put(`${base}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (e) {
      throw toApiError(e);
    }
  },

  /** DELETE /api/Resumes/{id} */
  async remove(id: number): Promise<void> {
    try {
      await api.delete(`${base}/${id}`);
    } catch (e) {
      throw toApiError(e);
    }
  }
};