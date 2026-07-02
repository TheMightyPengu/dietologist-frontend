import axios, { AxiosError } from "axios";
import { clearAdminToken, getAdminToken } from "@/lib/admin-auth";

// To test if it's actually connected, you can visit
// http://localhost:3000/dev/api-smoke
// after running npm run dev.

const baseURL = (() => {
  if (typeof window === "undefined") {
    return process.env.API_URL_INTERNAL || "http://host.docker.internal:8088/api";
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088/api";
})();

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/dashboard") &&
      window.location.pathname !== "/dashboard/login"
    ) {
      clearAdminToken();

      const next = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/dashboard/login?next=${encodeURIComponent(next)}`;
    }

    return Promise.reject(error);
  }
);

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function toMediaUrl(path: string): string {
  const base = "http://localhost:8088";
  console.log("toMediaUrl called with path:", path);
  return `${base}${path}`;
}

export const toApiError = (e: unknown): ApiError => {
  if (axios.isAxiosError(e)) {
    const err = e as AxiosError<unknown>;
    const data = err.response?.data as { message?: string } | undefined;

    return {
      status: err.response?.status ?? 0,
      message: data?.message ?? err.message,
      details: err.response?.data,
    };
  }

  const generic = e as { message?: string };

  return {
    status: 0,
    message: generic?.message ?? "Unexpected error",
    details: e,
  };
};