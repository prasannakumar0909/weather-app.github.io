import { motion } from 'framer-motion';
import { useForecast } from '@/hooks/useWeather';
import type { SavedCity, TemperatureUnit } from '@/types/weather';
import { formatTemp, formatHour } from '@/utils/format';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  city: SavedCity;
  unit: TemperatureUnit;
}

export const HourlyForecast = ({ city, unit }: Props) => {
  const { data, isLoading, isError } = useForecast(city, unit);

  if (isLoading) {
    return (
      <div className="glass animate-pulse rounded-3xl p-6">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="mt-4 flex gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 w-20 shrink-0 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) return null;

  // Show next 8 entries (≈ 24 hours at 3-hour resolution)
  const items = data.list.slice(0, 8);
  const tz = data.city.timezone;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass relative overflow-hidden rounded-3xl p-6"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
          Next 24 Hours
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
          3-hour intervals
        </span>
      </div>

      <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:thin]">
        {items.map((item, idx) => {
          const isNight =
            item.dt < data.city.sunrise || item.dt > data.city.sunset;
          return (
            <motion.div
              key={item.dt}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.4 }}
              className="flex w-20 shrink-0 flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-2 py-4 transition hover:border-white/25 hover:bg-white/10"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                {idx === 0 ? 'Now' : formatHour(item.dt, tz)}
              </span>
              <WeatherIcon
                condition={item.weather[0]?.main ?? ''}
                isNight={isNight}
                className="my-3 h-7 w-7 text-white"
                strokeWidth={1.5}
              />
              <span className="display-num text-xl">
                {formatTemp(item.main.temp)}
              </span>
              {item.pop > 0.1 && (
                <span className="mt-1 text-[10px] font-medium text-sky-300">
                  {Math.round(item.pop * 100)}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};
