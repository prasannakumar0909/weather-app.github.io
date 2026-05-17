import type { CurrentWeatherResponse, WeatherTheme } from '@/types/weather';

/**
 * Derive a theme key from weather condition + local time at the city.
 */
export const getWeatherTheme = (data?: CurrentWeatherResponse): WeatherTheme => {
  if (!data) return 'default';

  const main = data.weather[0]?.main?.toLowerCase() ?? '';
  // Determine if it's night at the city using its sunrise/sunset and current dt.
  const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;

  if (main.includes('thunder')) return 'thunderstorm';
  if (main.includes('rain') || main.includes('drizzle')) return 'rain';
  if (main.includes('snow')) return 'snow';
  if (main.includes('mist') || main.includes('fog') || main.includes('haze') || main.includes('smoke')) {
    return 'mist';
  }
  if (main.includes('cloud')) return isNight ? 'clouds-night' : 'clouds-day';
  if (main.includes('clear')) return isNight ? 'clear-night' : 'clear-day';
  return 'default';
};

/**
 * Gradient stops per theme. Designed for `linear-gradient(135deg, ...)`.
 */
export const themeGradients: Record<WeatherTheme, string> = {
  'clear-day':
    'linear-gradient(135deg, #f6a93b 0%, #f97316 40%, #db2777 100%)',
  'clear-night':
    'linear-gradient(135deg, #0c0a36 0%, #1e1b4b 45%, #312e81 100%)',
  'clouds-day':
    'linear-gradient(135deg, #64748b 0%, #475569 50%, #1e293b 100%)',
  'clouds-night':
    'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
  rain:
    'linear-gradient(135deg, #1e3a5f 0%, #1e293b 50%, #0f172a 100%)',
  thunderstorm:
    'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0c0a36 100%)',
  snow:
    'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #475569 100%)',
  mist:
    'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #334155 100%)',
  default:
    'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
};

/**
 * Accent color used for highlights, ring, glow, etc.
 */
export const themeAccents: Record<WeatherTheme, string> = {
  'clear-day': '#fbbf24',
  'clear-night': '#a78bfa',
  'clouds-day': '#cbd5e1',
  'clouds-night': '#94a3b8',
  rain: '#7dd3fc',
  thunderstorm: '#c4b5fd',
  snow: '#e0f2fe',
  mist: '#e2e8f0',
  default: '#94a3b8',
};
