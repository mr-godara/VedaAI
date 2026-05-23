import axios from 'axios';
import type { Assignment, AssignmentFormData, GeneratedPaper } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 90000, // 90s to survive Render cold boot (30-60s wake-up time)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Assignment API functions
export async function createAssignment(data: AssignmentFormData): Promise<{ assignmentId: string; jobId: string }> {
  const response = await api.post('/assignments', data);
  return response.data;
}

export async function getAssignments(): Promise<Assignment[]> {
  const response = await api.get('/assignments');
  return response.data;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
}

export async function getResult(id: string): Promise<GeneratedPaper> {
  const response = await api.get(`/assignments/${id}/result`);
  return response.data;
}

export async function regenerateAssignment(id: string): Promise<{ jobId: string }> {
  const response = await api.post(`/assignments/${id}/regenerate`);
  return response.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/assignments/${id}`);
}

export async function downloadPdf(id: string): Promise<Blob> {
  const response = await api.get(`/assignments/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function uploadFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export default api;
