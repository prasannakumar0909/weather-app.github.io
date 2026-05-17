import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCurrentWeather } from '@/hooks/useWeather';
import { useAppDispatch } from '@/store';
import { removeCity, setPrimary } from '@/store/citiesSlice';
import type { SavedCity, TemperatureUnit } from '@/types/weather';
import { formatTemp } from '@/utils/format';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  city: SavedCity;
  unit: TemperatureUnit;
  isActive: boolean;
}

export const MiniCard = ({ city, unit, isActive }: Props) => {
  const { data, isLoading, isError } = useCurrentWeather(city, unit);
  const dispatch = useAppDispatch();

  const condition = data?.weather[0];
  const isNight = data
    ? data.dt < data.sys.sunrise || data.dt > data.sys.sunset
    : false;

  const handleSelect = () => {
    if (!isActive) dispatch(setPrimary(city.id));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeCity(city.id));
  };

  return (
    <motion.button
      layout
      onClick={handleSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex h-full min-h-[160px] w-full flex-col items-start justify-between overflow-hidden rounded-3xl p-5 text-left transition ${
        isActive
          ? 'glass-strong ring-1 ring-white/40'
          : 'glass hover:border-white/30'
      }`}
      aria-label={`View ${city.displayName}${isActive ? ' (current)' : ''}`}
      aria-current={isActive}
    >
      {/* Remove button */}
      <span
        role="button"
        tabIndex={0}
        onClick={handleRemove}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleRemove(e as unknown as React.MouseEvent);
          }
        }}
        aria-label={`Remove ${city.displayName}`}
        className="absolute right-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/60 opacity-0 transition hover:bg-black/40 hover:text-white group-hover:opacity-100 focus:opacity-100"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>

      {isActive && (
        <motion.span
          layoutId="active-badge"
          className="absolute left-5 top-5 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-900"
        >
          Primary
        </motion.span>
      )}

      <div className={`w-full ${isActive ? 'mt-6' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {city.displayName}
            </div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
              {city.country ?? (data?.sys.country ?? '')}
            </div>
          </div>
          {condition && (
            <WeatherIcon
              condition={condition.main}
              isNight={isNight}
              className="h-7 w-7 shrink-0 text-white"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>

      <div className="mt-4 flex w-full items-end justify-between">
        {isLoading ? (
          <div className="h-10 w-20 animate-pulse rounded bg-white/10" />
        ) : isError || !data ? (
          <div className="text-xs text-white/50">Failed to load</div>
        ) : (
          <>
            <span className="display-num text-5xl">{formatTemp(data.main.temp)}</span>
            <span className="pb-1.5 text-xs capitalize text-white/60">
              {condition?.description}
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
};
