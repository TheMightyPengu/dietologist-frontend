import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5000/api
  headers: { 'Content-Type': 'application/json' }
});

export type ApiError = { status: number; message: string; details?: unknown };
export const toApiError = (e: unknown): ApiError => {
  const err = e as AxiosError<any>;
  return {
    status: err.response?.status ?? 0,
    message: (err.response?.data?.message as string) || err.message,
    details: err.response?.data
  };
};
