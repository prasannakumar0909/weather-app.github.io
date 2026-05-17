import { motion } from 'framer-motion';
import { Loader2, MapPin } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAppDispatch } from '@/store';
import { addCity, setGeoConsent } from '@/store/citiesSlice';
import toast from 'react-hot-toast';

export const NoState = () => {
  const { loading, request } = useGeolocation();
  const dispatch = useAppDispatch();

  const useMyLocation = async () => {
    const city = await request();
    if (city) {
      dispatch(addCity(city));
      dispatch(setGeoConsent(true));
      toast.success(`Located: ${city.displayName}`);
    } else {
      toast.error('Location unavailable. Try adding a ZIP code instead.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-strong relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] p-10 text-center sm:p-14"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'backOut' }}
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10"
      >
        <MapPin className="h-7 w-7 text-white" strokeWidth={1.5} />
      </motion.div>

      <h1 className="font-display text-5xl font-light leading-tight tracking-tight text-white sm:text-6xl">
        Welcome to{' '}
        <span className="italic text-white/70">Forecast</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/60">
        Begin with your current location, or add up to five
        cities by ZIP code
      </p>

      <button
        onClick={useMyLocation}
        disabled={loading}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-900 transition hover:scale-[1.02] hover:bg-white/90 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" strokeWidth={2.5} />
        )}
        {loading ? 'Locating' : 'Use My Location'}
      </button>

      <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/40">
        or add a city by zip above
      </p>
    </motion.div>
  );
};
