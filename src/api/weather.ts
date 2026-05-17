import { weatherClient, geoClient } from './client';
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  TemperatureUnit,
} from '@/types/weather';

interface ZipLookupResponse {
  zip: string;
  name: string;
  lat: number;
  lon: number;
  country: string; 
}

/**
 * Resolve a zip/postal code to coordinates using OpenWeatherMap's geo API.
 */
export const lookupZip = async (
  zip: string,
  country = 'US'
): Promise<ZipLookupResponse> => {
  const { data } = await geoClient.get<ZipLookupResponse>('/zip', {
    params: { zip: `${zip},${country}` },
  });
  return data;
};

/**
 * Fetch current weather by coordinates.
 */
export const fetchCurrentWeather = async (
  lat: number,
  lon: number,
  units: TemperatureUnit
): Promise<CurrentWeatherResponse> => {
  const { data } = await weatherClient.get<CurrentWeatherResponse>('/weather', {
    params: { lat, lon, units },
  });
  return data;
};

/**
 * Fetch 5-day / 3-hour forecast by coordinates.
 */
export const fetchForecast = async (
  lat: number,
  lon: number,
  units: TemperatureUnit
): Promise<ForecastResponse> => {
  const { data } = await weatherClient.get<ForecastResponse>('/forecast', {
    params: { lat, lon, units },
  });
  return data;
};
