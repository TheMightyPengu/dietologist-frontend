import { api } from "./_axios-client";

export type OfficeHoursGetDto = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type OfficeHoursPostDto = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export type WeeklyOfficeHours = {
  monday: OfficeHoursGetDto[];
  tuesday: OfficeHoursGetDto[];
  wednesday: OfficeHoursGetDto[];
  thursday: OfficeHoursGetDto[];
  friday: OfficeHoursGetDto[];
  saturday: OfficeHoursGetDto[];
  sunday: OfficeHoursGetDto[];
};

export const OfficeHoursApi = {
  async getWeekly(): Promise<WeeklyOfficeHours> {
    const response = await api.get<WeeklyOfficeHours>(
      "/OfficeHours/weekly"
    );

    return response.data;
  },

  async replaceWeekly(
    payload: OfficeHoursPostDto[]
  ): Promise<void> {
    await api.put("/OfficeHours/weekly", payload);
  },
};