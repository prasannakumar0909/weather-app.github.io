import { getWeatherTheme, themeGradients, themeAccents } from './theme';
import type { CurrentWeatherResponse } from '@/types/weather';

describe('theme utilities', () => {
  const createMockWeatherData = (main: string, dt: number, sunrise: number, sunset: number): CurrentWeatherResponse => {
    return {
      id: 1,
      name: 'Test City',
      coord: { lat: 10, lon: 20 },
      weather: [{ id: 800, main, description: 'mock', icon: '01d' }],
      main: { temp: 20, feels_like: 19, temp_min: 18, temp_max: 22, pressure: 1013, humidity: 50 },
      wind: { speed: 5, deg: 180 },
      clouds: { all: 0 },
      dt,
      sys: { country: 'US', sunrise, sunset },
      timezone: 0,
      visibility: 10000,
    };
  };

  describe('getWeatherTheme', () => {
    it('returns default theme when data is missing', () => {
      expect(getWeatherTheme(undefined)).toBe('default');
    });

    it('returns thunderstorm theme when condition includes thunder', () => {
      const data = createMockWeatherData('Thunderstorm', 1620000000, 1619980000, 1620020000);
      expect(getWeatherTheme(data)).toBe('thunderstorm');
    });

    it('returns rain theme when condition includes rain or drizzle', () => {
      const rainData = createMockWeatherData('Heavy Rain', 1620000000, 1619980000, 1620020000);
      const drizzleData = createMockWeatherData('Drizzle', 1620000000, 1619980000, 1620020000);
      expect(getWeatherTheme(rainData)).toBe('rain');
      expect(getWeatherTheme(drizzleData)).toBe('rain');
    });

    it('returns snow theme when condition includes snow', () => {
      const data = createMockWeatherData('Light Snow', 1620000000, 1619980000, 1620020000);
      expect(getWeatherTheme(data)).toBe('snow');
    });

    it('returns mist theme when condition includes mist, fog, haze or smoke', () => {
      const mistData = createMockWeatherData('Mist', 1620000000, 1619980000, 1620020000);
      const fogData = createMockWeatherData('Fog', 1620000000, 1619980000, 1620020000);
      const hazeData = createMockWeatherData('Haze', 1620000000, 1619980000, 1620020000);
      const smokeData = createMockWeatherData('Smoke', 1620000000, 1619980000, 1620020000);
      expect(getWeatherTheme(mistData)).toBe('mist');
      expect(getWeatherTheme(fogData)).toBe('mist');
      expect(getWeatherTheme(hazeData)).toBe('mist');
      expect(getWeatherTheme(smokeData)).toBe('mist');
    });

    it('returns clouds-day and clouds-night based on sunrise/sunset times', () => {
      const dayData = createMockWeatherData('Clouds', 1620000000, 1619980000, 1620020000); // 1620000000 is between sunrise and sunset
      const nightBeforeSunrise = createMockWeatherData('Clouds', 1619970000, 1619980000, 1620020000); // 1619970000 is before sunrise
      const nightAfterSunset = createMockWeatherData('Clouds', 1620030000, 1619980000, 1620020000); // 1620030000 is after sunset

      expect(getWeatherTheme(dayData)).toBe('clouds-day');
      expect(getWeatherTheme(nightBeforeSunrise)).toBe('clouds-night');
      expect(getWeatherTheme(nightAfterSunset)).toBe('clouds-night');
    });

    it('returns clear-day and clear-night based on sunrise/sunset times', () => {
      const dayData = createMockWeatherData('Clear', 1620000000, 1619980000, 1620020000);
      const nightData = createMockWeatherData('Clear', 1620030000, 1619980000, 1620020000);

      expect(getWeatherTheme(dayData)).toBe('clear-day');
      expect(getWeatherTheme(nightData)).toBe('clear-night');
    });

    it('returns default when condition is unknown', () => {
      const data = createMockWeatherData('Tornado', 1620000000, 1619980000, 1620020000);
      expect(getWeatherTheme(data)).toBe('default');
    });

    it('returns default theme when weather array is empty or main is missing', () => {
      const emptyWeather = {
        id: 1,
        name: 'Test City',
        coord: { lat: 10, lon: 20 },
        weather: [],
        main: { temp: 20, feels_like: 19, temp_min: 18, temp_max: 22, pressure: 1013, humidity: 50 },
        wind: { speed: 5, deg: 180 },
        clouds: { all: 0 },
        dt: 1620000000,
        sys: { country: 'US', sunrise: 1619980000, sunset: 1620020000 },
        timezone: 0,
        visibility: 10000,
      } as any;
      expect(getWeatherTheme(emptyWeather)).toBe('default');

      const missingMain = {
        id: 1,
        name: 'Test City',
        coord: { lat: 10, lon: 20 },
        weather: [{ id: 800, description: 'mock', icon: '01d' }],
        main: { temp: 20, feels_like: 19, temp_min: 18, temp_max: 22, pressure: 1013, humidity: 50 },
        wind: { speed: 5, deg: 180 },
        clouds: { all: 0 },
        dt: 1620000000,
        sys: { country: 'US', sunrise: 1619980000, sunset: 1620020000 },
        timezone: 0,
        visibility: 10000,
      } as any;
      expect(getWeatherTheme(missingMain)).toBe('default');
    });
  });

  describe('gradients and accents dictionaries', () => {
    it('contains configurations for all defined themes', () => {
      const themes = [
        'clear-day',
        'clear-night',
        'clouds-day',
        'clouds-night',
        'rain',
        'thunderstorm',
        'snow',
        'mist',
        'default',
      ] as const;

      themes.forEach((theme) => {
        expect(themeGradients[theme]).toBeDefined();
        expect(themeAccents[theme]).toBeDefined();
      });
    });
  });
});
