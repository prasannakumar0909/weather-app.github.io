import { AnimatePresence, motion } from 'framer-motion';
import { themeGradients } from '@/utils/theme';
import type { WeatherTheme } from '@/types/weather';
import { WeatherEffects } from './WeatherEffects';

interface Props {
  theme: WeatherTheme;
}

/**
 * Fixed-position background layer.
 * Crossfades gradient when theme changes, with weather particles on top.
 */
export const DynamicBackground = ({ theme }: Props) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden grain">
      <AnimatePresence mode="sync">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ background: themeGradients[theme] }}
        />
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      <WeatherEffects theme={theme} />
    </div>
  );
};
