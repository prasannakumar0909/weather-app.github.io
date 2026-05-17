import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addCity, MAX_CITIES, setGeoConsent } from '@/store/citiesSlice';
import { useCurrentWeather } from '@/hooks/useWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getWeatherTheme } from '@/utils/theme';
import { DynamicBackground } from './DynamicBackground';
import { SearchBar } from './SearchBar';
import { UnitToggle } from './UnitToggle';
import { HeroCard } from './HeroCard';
import { MiniCard } from './MiniCard';
import { HourlyForecast } from './HourlyForecast';
import { DailyForecast } from './DailyForecast';
import { NoState } from './NoState';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { cities, primaryId, unit, hasGeoConsent } = useAppSelector((s) => s.cities);
  const { request } = useGeolocation();

  // Try geolocation in the background ONCE if no cities exist and the browser has already granted permission.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cities.length > 0 || hasGeoConsent) return;
      if (
        !('permissions' in navigator) ||
        typeof navigator.permissions.query !== 'function'
      ) {
        return;
      }
      try {
        const status = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        if (status.state !== 'granted') return;
      } catch {
        return;
      }
      const city = await request();
      if (!cancelled && city) {
        dispatch(addCity(city));
        dispatch(setGeoConsent(true));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [cities.length, hasGeoConsent, request, dispatch]);

  const primaryCity = useMemo(
    () => cities.find((c) => c.id === primaryId) ?? cities[0],
    [cities, primaryId]
  );

  // Drive the background theme from the primary city's weather
  const primaryWeather = useCurrentWeather(primaryCity, unit);
  const theme = getWeatherTheme(primaryWeather.data);

  const otherCities = useMemo(
    () => cities.filter((c) => c.id !== primaryCity?.id),
    [cities, primaryCity]
  );

  return (
    <>
      <DynamicBackground theme={theme} />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900">
              <MapPin className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none">
                Forecast
                <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                  · Weather
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar />
            <UnitToggle />
          </div>
        </motion.header>

        {/* Body */}
        {cities.length === 0 ? (
          <NoState />
        ) : primaryCity ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Hero + Hourly */}
            <div className="space-y-6 lg:col-span-2">
              <HeroCard city={primaryCity} unit={unit} />
              <HourlyForecast city={primaryCity} unit={unit} />
            </div>

            {/* Side rail */}
            <div className="space-y-6">
              <DailyForecast city={primaryCity} unit={unit} />

              {/* City picker */}
              <section className="glass rounded-3xl p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                    My Cities
                  </h3>
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                    {cities.length} / {MAX_CITIES}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <AnimatePresence>
                    {cities.map((c) => (
                      <MiniCard
                        key={c.id}
                        city={c}
                        unit={unit}
                        isActive={c.id === primaryCity.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {otherCities.length === 0 && cities.length < MAX_CITIES && (
                  <p className="mt-4 text-center text-xs italic text-white/50">
                    Add up to {MAX_CITIES - cities.length} more{' '}
                    {MAX_CITIES - cities.length === 1 ? 'city' : 'cities'} by ZIP code above.
                  </p>
                )}
              </section>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40"
        >
        </motion.footer>
      </main>
    </>
  );
};
