import type { TemperatureUnit } from '@/types/weather';

export const formatTemp = (value: number): string => `${Math.round(value)}°`;

export const tempUnitLabel = (unit: TemperatureUnit): string =>
  unit === 'metric' ? 'C' : 'F';

export const windUnitLabel = (unit: TemperatureUnit): string =>
  unit === 'metric' ? 'm/s' : 'mph';

/**
 * Format a unix timestamp to a local time string given a timezone offset (seconds).
 */
export const formatLocalTime = (
  unixSec: number,
  timezoneSec: number,
  opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string => {
  const date = new Date((unixSec + timezoneSec) * 1000);
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(date);
};

export const formatDay = (unixSec: number, timezoneSec: number): string =>
  formatLocalTime(unixSec, timezoneSec, { weekday: 'short' });

export const formatHour = (unixSec: number, timezoneSec: number): string =>
  formatLocalTime(unixSec, timezoneSec, { hour: 'numeric' });

/**
 * Generic debounce.
 */
export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
