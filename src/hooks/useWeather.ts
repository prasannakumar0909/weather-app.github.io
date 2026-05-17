import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCurrentWeather, fetchForecast, lookupZip } from '@/api/weather';
import type {
  CurrentWeatherResponse,
  ForecastResponse,
  SavedCity,
  TemperatureUnit,
} from '@/types/weather';

const STALE_MS = 1000 * 60 * 10; // 10 minutes
const GC_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Query: current weather for a saved city.
 * Disabled if the city lacks coordinates.
 */
export const useCurrentWeather = (
  city: SavedCity | undefined,
  unit: TemperatureUnit
): UseQueryResult<CurrentWeatherResponse, Error> => {
  return useQuery({
    queryKey: ['current', city?.id, unit],
    queryFn: () => fetchCurrentWeather(city!.lat!, city!.lon!, unit),
    enabled: Boolean(city?.lat && city?.lon),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: 1,
  });
};

/**
 * Query: 5-day forecast for a saved city.
 */
export const useForecast = (
  city: SavedCity | undefined,
  unit: TemperatureUnit
): UseQueryResult<ForecastResponse, Error> => {
  return useQuery({
    queryKey: ['forecast', city?.id, unit],
    queryFn: () => fetchForecast(city!.lat!, city!.lon!, unit),
    enabled: Boolean(city?.lat && city?.lon),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    retry: 1,
  });
};

export { lookupZip };
