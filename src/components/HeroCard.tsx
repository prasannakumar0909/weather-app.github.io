import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Eye, Gauge, MapPin, Sunrise, Sunset, Wind } from 'lucide-react';
import { useCurrentWeather } from '@/hooks/useWeather';
import type { SavedCity, TemperatureUnit } from '@/types/weather';
import {
  formatLocalTime,
  formatTemp,
  tempUnitLabel,
  windUnitLabel,
} from '@/utils/format';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  city: SavedCity;
  unit: TemperatureUnit;
}

const Metric = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <div className="text-white/70">{icon}</div>
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
        {label}
      </div>
      <div className="truncate text-sm font-medium text-white">{value}</div>
    </div>
  </div>
);

export const HeroCard = ({ city, unit }: Props) => {
  const { data, isLoading, isError, error } = useCurrentWeather(city, unit);

  if (isLoading) {
    return (
      <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-32 w-48 rounded bg-white/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="glass-strong rounded-[2rem] p-8">
        <p className="font-display text-2xl text-white">Couldn't load this city.</p>
        <p className="mt-2 text-sm text-white/60">{error?.message ?? 'Unknown error.'}</p>
      </div>
    );
  }

  const condition = data.weather[0];
  const isNight = data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
  const tz = data.timezone;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={city.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-10"
      >
        {/* Decorative giant icon */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="pointer-events-none absolute -right-12 -top-12 text-white"
        >
          <WeatherIcon
            condition={condition?.main ?? ''}
            isNight={isNight}
            className="h-72 w-72"
            strokeWidth={0.6}
          />
        </motion.div>

        {/* Header */}
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="h-4 w-4" strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">
                {city.displayName}
                {data.sys.country ? ` · ${data.sys.country}` : ''}
              </span>
            </div>
            <p className="mt-1 font-display text-sm italic text-white/50">
              {formatLocalTime(data.dt, tz, {
                weekday: 'long',
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              local
            </p>
          </div>
        </div>

        {/* Temperature + condition */}
        <div className="relative mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-start"
          >
            <span className="display-num text-[7rem] leading-[0.85] sm:text-[9rem]">
              {Math.round(data.main.temp)}
            </span>
            <span className="display-num mt-2 text-3xl text-white/70 sm:mt-4 sm:text-5xl">
              °{tempUnitLabel(unit)}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="pb-4"
          >
            <div className="font-display text-3xl capitalize text-white sm:text-4xl">
              {condition?.description ?? '—'}
            </div>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-white/60">
              Feels like {formatTemp(data.main.feels_like)} · H{' '}
              {formatTemp(data.main.temp_max)} · L {formatTemp(data.main.temp_min)}
            </div>
          </motion.div>
        </div>

        {/* Metrics grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          <Metric
            icon={<Wind className="h-4 w-4" strokeWidth={2} />}
            label="Wind"
            value={`${Math.round(data.wind.speed)} ${windUnitLabel(unit)}`}
          />
          <Metric
            icon={<Droplets className="h-4 w-4" strokeWidth={2} />}
            label="Humidity"
            value={`${data.main.humidity}%`}
          />
          <Metric
            icon={<Gauge className="h-4 w-4" strokeWidth={2} />}
            label="Pressure"
            value={`${data.main.pressure} hPa`}
          />
          <Metric
            icon={<Eye className="h-4 w-4" strokeWidth={2} />}
            label="Visibility"
            value={`${(data.visibility / 1000).toFixed(1)} km`}
          />
          <Metric
            icon={<Sunrise className="h-4 w-4" strokeWidth={2} />}
            label="Sunrise"
            value={formatLocalTime(data.sys.sunrise, tz)}
          />
          <Metric
            icon={<Sunset className="h-4 w-4" strokeWidth={2} />}
            label="Sunset"
            value={formatLocalTime(data.sys.sunset, tz)}
          />
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
};
