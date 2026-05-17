import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store';
import { setUnit } from '@/store/citiesSlice';

export const UnitToggle = () => {
  const unit = useAppSelector((s) => s.cities.unit);
  const dispatch = useAppDispatch();
  const isC = unit === 'metric';

  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="glass relative flex h-9 items-center rounded-full p-0.5 text-xs font-semibold uppercase tracking-[0.15em]"
    >
      <motion.div
        aria-hidden
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-white"
        animate={{ left: isC ? '2px' : 'calc(50% + 0px)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
      <button
        onClick={() => dispatch(setUnit('metric'))}
        aria-pressed={isC}
        className={`relative z-10 flex-1 px-4 py-1 transition ${
          isC ? 'text-slate-900' : 'text-white/70 hover:text-white'
        }`}
      >
        °C
      </button>
      <button
        onClick={() => dispatch(setUnit('imperial'))}
        aria-pressed={!isC}
        className={`relative z-10 flex-1 px-4 py-1 transition ${
          !isC ? 'text-slate-900' : 'text-white/70 hover:text-white'
        }`}
      >
        °F
      </button>
    </div>
  );
};
