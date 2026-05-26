import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
});

// Normalize errors so users always get a clean Error with message
const handleError = (error: AxiosError<{ message?: string }>) => {
  const status = error.response?.status;
  const apiMsg = error.response?.data?.message;

  if (status === 401) {
    return Promise.reject(new Error('Invalid backend credentials or OpenWeatherMap API key.'));
  }
  if (status === 404) {
    return Promise.reject(new Error(apiMsg ?? 'Location not found.'));
  }
  if (status === 429) {
    return Promise.reject(new Error('Rate limit reached. Please slow down.'));
  }
  if (error.code === 'ECONNABORTED') {
    return Promise.reject(new Error('Request timed out. Check your connection.'));
  }
  return Promise.reject(new Error(apiMsg ?? error.message ?? 'Something went wrong.'));
};

apiClient.interceptors.response.use((r) => r, handleError);
