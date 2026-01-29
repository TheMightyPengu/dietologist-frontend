import { api, toApiError } from './_axios-client';

export type ProvidedServices = {
  id: number;
  category: string;
  duration: number;
  description: string;
  priceIncludingVAT: number;
  intervalInDays: number;
};

export type AppointmentsGetDto = {
  id: number;
  serviceId: number;
  providedService: ProvidedServices;
  appointmentDate: string; // ISO
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPrepaid: boolean;
};

export type AppointmentsPostDto = {
  serviceId: number;
  providedService: ProvidedServices;
  appointmentDate: string; // ISO
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPrepaid: boolean;
};

const base = '/Appointments';

export const AppointmentsApi = {
  async list(): Promise<AppointmentsGetDto[]> {
    try {
      const { data } = await api.get(base);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async get(id: number): Promise<AppointmentsGetDto> {
    try {
      const { data } = await api.get(`${base}/${id}`);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async create(payload: AppointmentsPostDto): Promise<AppointmentsGetDto> {
    try {
      const { data } = await api.post(base, payload);
      return data;
    } catch (e) {
      throw toApiError(e);
    }
  },

  async update(id: number, payload: AppointmentsPostDto): Promise<void> {
    try {
      await api.put(`${base}/${id}`, payload);
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