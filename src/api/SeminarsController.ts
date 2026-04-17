import axios from "axios";

export type SeminarMode = "create" | "edit";

export type Seminar = {
  id: number;
  category: string;
  duration: number;
  title: string;
  description: string;
};

export type SeminarPayload = {
  category: string;
  duration: number;
  title: string;
  description: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const seminarsApi = axios.create({
  baseURL: `${API_BASE}/Seminars`,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getSeminars(): Promise<Seminar[]> {
  const response = await seminarsApi.get<Seminar[]>("");
  return response.data;
}

export async function getSeminarById(id: number): Promise<Seminar> {
  const response = await seminarsApi.get<Seminar>(`/${id}`);
  return response.data;
}

export async function createSeminar(payload: SeminarPayload): Promise<Seminar> {
  const response = await seminarsApi.post<Seminar>("", payload);
  return response.data;
}

export async function updateSeminar(
  id: number,
  payload: SeminarPayload,
): Promise<void> {
  await seminarsApi.put(`/${id}`, payload);
}

export async function deleteSeminar(id: number): Promise<void> {
  await seminarsApi.delete(`/${id}`);
}