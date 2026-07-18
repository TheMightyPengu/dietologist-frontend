import { api } from "./_axios-client";

export type WebsiteThemeGetDto = {
  id: number;
  primary: string;
  primaryDark: string;
  accent: string;
  accentSoft: string;
  warm: string;
  background: string;
  surface: string;
  surfaceSoft: string;
  ink: string;
  muted: string;
  border: string;
  buttonText: string;
  backgroundGradientOne: string;
  backgroundGradientTwo: string;
  backgroundGradientThree: string;
};

export type WebsiteThemeUpdateDto = Omit<WebsiteThemeGetDto, "id">;

export const WebsiteThemeApi = {
  async get(): Promise<WebsiteThemeGetDto> {
    const response = await api.get<WebsiteThemeGetDto>("/WebsiteTheme");
    return response.data;
  },

  async update(data: WebsiteThemeUpdateDto): Promise<WebsiteThemeGetDto> {
    const response = await api.put<WebsiteThemeGetDto>("/WebsiteTheme", data);
    return response.data;
  },
};