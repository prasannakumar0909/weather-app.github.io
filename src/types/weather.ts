// Weather API response types

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  id: number;
  main: string; // "Clear" | "Clouds" | "Rain" | "Snow" | "Thunderstorm" | "Drizzle" | "Mist" etc.
  description: string;
  icon: string;
}

export interface MainWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface Wind {
  speed: number;
  deg: number;
  gust?: number;
}

export interface Sys {
  country: string;
  sunrise: number;
  sunset: number;
}

export interface CurrentWeatherResponse {
  coord: Coordinates;
  weather: WeatherCondition[];
  main: MainWeather;
  visibility: number;
  wind: Wind;
  clouds: { all: number };
  dt: number;
  sys: Sys;
  timezone: number;
  id: number;
  name: string;
}

export interface ForecastItem {
  dt: number;
  main: MainWeather;
  weather: WeatherCondition[];
  wind: Wind;
  pop: number; // probability of precipitation
  dt_txt: string;
}

export interface ForecastResponse {
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

// App-level types

export interface SavedCity {
  id: string; // unique identifier: zip-country or "geo-{lat}-{lon}"
  zip?: string;
  country?: string;
  lat?: number;
  lon?: number;
  displayName: string;
  addedAt: number;
}

export type TemperatureUnit = 'metric' | 'imperial';

export type WeatherTheme =
  | 'clear-day'
  | 'clear-night'
  | 'clouds-day'
  | 'clouds-night'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'default';
