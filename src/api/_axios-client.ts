import axios, { AxiosError } from 'axios';

// To test if it's actually connected, you can visit
// http://localhost:3000/dev/api-smoke
// (after running npm run dev) to see which endpoints are working.

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5000/api
  headers: { 'Content-Type': 'application/json' },
});

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

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
