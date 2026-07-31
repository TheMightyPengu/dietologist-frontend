import { api } from "@/api/_axios-client";

export type AdminSession = {
  authenticated: boolean;
  userId: string | null;
  username: string | null;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const response = await api.get<AdminSession>("/Admin/session");
    return response.data;
  } catch {
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await api.post("/Admin/logout");
  } finally {
    window.location.href = "/dashboard/login";
  }
}