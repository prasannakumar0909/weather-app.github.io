import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL ?? 'https://api.openweathermap.org/data/2.5';
const GEO_URL = import.meta.env.VITE_GEO_BASE_URL ?? 'https://api.openweathermap.org/geo/1.0';
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

if (!API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Forecast] VITE_WEATHER_API_KEY is not set.'
  );
}

export const weatherClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

export const geoClient = axios.create({
  baseURL: GEO_URL,
  timeout: 10_000,
});

// Inject API key on every request
const attachKey = (config: any) => {
  config.params = { ...(config.params ?? {}), appid: API_KEY };
  return config;
};

weatherClient.interceptors.request.use(attachKey);
geoClient.interceptors.request.use(attachKey);

// Normalize errors so users always get a clean Error with message
const handleError = (error: AxiosError<{ message?: string }>) => {
  const status = error.response?.status;
  const apiMsg = error.response?.data?.message;

  if (status === 401) {
    return Promise.reject(new Error('Invalid API key. Check your VITE_WEATHER_API_KEY.'));
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

weatherClient.interceptors.response.use((r) => r, handleError);
geoClient.interceptors.response.use((r) => r, handleError);
