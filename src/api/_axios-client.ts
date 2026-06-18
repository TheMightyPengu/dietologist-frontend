import axios, { AxiosError } from 'axios';

// To test if it's actually connected, you can visit
// http://localhost:3000/dev/api-smoke
// (after running npm run dev) to see which endpoints are working.

const baseURL = (() => {
  if (typeof window === 'undefined') {
    // Server-side (getServerSideProps, API routes)
    // Use host.docker.internal to reach the host machine from Docker
    return process.env.API_URL_INTERNAL || 'http://host.docker.internal:8088/api';
  }
  // Client-side (browser)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';
})();

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export function toMediaUrl(path: string): string {
  const base = 'http://localhost:8088';
  console.log("toMediaUrl called with path:", path);
  return `${base}${path}`;
}

export const toApiError = (e: unknown): ApiError => {
  // Axios error branch
  if (axios.isAxiosError(e)) {
    const err = e as AxiosError<unknown>;
    const data = err.response?.data as { message?: string } | undefined;

    return {
      status: err.response?.status ?? 0,
      message: data?.message ?? err.message,
      details: err.response?.data,
    };
  }

  // Non-Axios error (generic fallback)
  const generic = e as { message?: string };

  return {
    status: 0,
    message: generic?.message ?? 'Unexpected error',
    details: e,
  };
};
