import { api } from "./_axios-client";

export type OfficeHoursGetDto = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
};

export type OfficeHoursPostDto = {
  startTime: string;
  endTime: string;
};

export const OfficeHoursApi = {
  async getMonth(year: number, month: number): Promise<OfficeHoursGetDto[]> {
    const response = await api.get<OfficeHoursGetDto[]>("/OfficeHours", {
      params: { year, month },
    });
    return response.data;
  },

  async replaceDate(date: string, periods: OfficeHoursPostDto[]): Promise<void> {
    await api.put(`/OfficeHours/date/${date}`, periods);
  },

  async deleteDate(date: string): Promise<void> {
    await api.delete(`/OfficeHours/date/${date}`);
  },
};
