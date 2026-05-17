import { motion } from 'framer-motion';
import { useForecast } from '@/hooks/useWeather';
import type { ForecastResponse, SavedCity, TemperatureUnit } from '@/types/weather';
import { formatTemp, formatDay } from '@/utils/format';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  city: SavedCity;
  unit: TemperatureUnit;
}

interface DailySummary {
  date: string;
  dt: number;
  min: number;
  max: number;
  condition: string;
  pop: number;
}

/**
 * Summarize the 3-hour forecast list into per-day summaries.
 */
const summarize = (forecast: ForecastResponse | undefined): DailySummary[] => {
  if (!forecast) return [];

  const byDay = new Map<string, DailySummary>();
  forecast.list.forEach((item) => {
    const date = item.dt_txt.slice(0, 10);
    const existing = byDay.get(date);
    if (existing) {
      existing.min = Math.min(existing.min, item.main.temp_min);
      existing.max = Math.max(existing.max, item.main.temp_max);
      existing.pop = Math.max(existing.pop, item.pop);
      // Prefer the midday condition for representativeness
      if (item.dt_txt.includes('12:00:00')) {
        existing.condition = item.weather[0]?.main ?? existing.condition;
      }
    } else {
      byDay.set(date, {
        date,
        dt: item.dt,
        min: item.main.temp_min,
        max: item.main.temp_max,
        pop: item.pop,
        condition: item.weather[0]?.main ?? 'Clear',
      });
    }
  });

  return Array.from(byDay.values()).slice(0, 5);
};

export const DailyForecast = ({ city, unit }: Props) => {
  const { data, isLoading, isError } = useForecast(city, unit);

  if (isLoading) {
    return (
      <div className="glass animate-pulse rounded-3xl p-6">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  const days = summarize(data);
  const tz = data.city.timezone;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-3xl p-6"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
        5-Day Outlook
      </h3>
      <div className="space-y-1">
        {days.map((d, idx) => (
          <motion.div
            key={d.date}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-white/5"
          >
            <span className="w-12 text-sm font-medium uppercase tracking-wider text-white/70">
              {idx === 0 ? 'Today' : formatDay(d.dt, tz)}
            </span>
            <div className="flex flex-1 items-center justify-center gap-2">
              <WeatherIcon
                condition={d.condition}
                className="h-5 w-5 text-white/80"
                strokeWidth={1.5}
              />
              {d.pop > 0.1 && (
                <span className="text-xs font-medium text-sky-300">
                  {Math.round(d.pop * 100)}%
                </span>
              )}
            </div>
            <div className="flex w-24 items-center justify-end gap-3 font-display">
              <span className="text-base text-white/50">{formatTemp(d.min)}</span>
              <span className="text-base text-white">{formatTemp(d.max)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};
