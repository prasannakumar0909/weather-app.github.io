import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { WeatherTheme } from '@/types/weather';

interface Props {
  theme: WeatherTheme;
}

/**
 * Layered background effects keyed to weather theme.
 * - Memoized so re-renders of parent don't reseed particles.
 */
const WeatherEffectsImpl = ({ theme }: Props) => {
  // Pre-generate particles once per theme
  const rainDrops = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.6 + Math.random() * 0.6,
        opacity: 0.3 + Math.random() * 0.4,
      })),
    []
  );

  const snowFlakes = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
        size: 2 + Math.random() * 4,
        drift: -20 + Math.random() * 40,
      })),
    []
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        top: 10 + Math.random() * 60,
        scale: 0.7 + Math.random() * 0.8,
        duration: 60 + Math.random() * 40,
        delay: -Math.random() * 60,
        opacity: 0.08 + Math.random() * 0.1,
      })),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 4,
      })),
    []
  );

  const isRain = theme === 'rain' || theme === 'thunderstorm';
  const isSnow = theme === 'snow';
  const isClouds = theme === 'clouds-day' || theme === 'clouds-night' || theme === 'mist';
  const isNight = theme === 'clear-night' || theme === 'clouds-night';
  const isSunny = theme === 'clear-day';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Stars (night themes) */}
      {isNight &&
        stars.map((s) => (
          <motion.span
            key={`star-${s.id}`}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
            }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: s.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* Sun glow (clear day) */}
      {isSunny && (
        <motion.div
          className="absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(253,224,71,0.45) 0%, rgba(251,146,60,0.2) 35%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Drifting clouds */}
      {(isClouds || isRain) &&
        clouds.map((c) => (
          <motion.div
            key={`cloud-${c.id}`}
            className="absolute"
            style={{
              top: `${c.top}%`,
              opacity: c.opacity,
              filter: 'blur(2px)',
            }}
            initial={{ x: '-30vw' }}
            animate={{ x: '130vw' }}
            transition={{
              duration: c.duration,
              repeat: Infinity,
              delay: c.delay,
              ease: 'linear',
            }}
          >
            <svg
              width={220 * c.scale}
              height={100 * c.scale}
              viewBox="0 0 220 100"
              fill="white"
            >
              <ellipse cx="60" cy="60" rx="50" ry="30" />
              <ellipse cx="110" cy="50" rx="55" ry="35" />
              <ellipse cx="160" cy="60" rx="45" ry="28" />
            </svg>
          </motion.div>
        ))}

      {/* Rain */}
      {isRain &&
        rainDrops.map((d) => (
          <motion.span
            key={`rain-${d.id}`}
            className="absolute top-0 w-px"
            style={{
              left: `${d.left}%`,
              height: '60px',
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0), rgba(186,230,253,0.7))',
              opacity: d.opacity,
            }}
            initial={{ y: -80 }}
            animate={{ y: '110vh' }}
            transition={{
              duration: d.duration,
              repeat: Infinity,
              delay: d.delay,
              ease: 'linear',
            }}
          />
        ))}

      {/* Lightning (thunderstorm) */}
      {theme === 'thunderstorm' && (
        <motion.div
          className="absolute inset-0 bg-white"
          animate={{ opacity: [0, 0, 0, 0.35, 0, 0.15, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            times: [0, 0.4, 0.45, 0.47, 0.5, 0.52, 0.55],
            ease: 'easeOut',
          }}
        />
      )}

      {/* Snow */}
      {isSnow &&
        snowFlakes.map((f) => (
          <motion.span
            key={`snow-${f.id}`}
            className="absolute top-0 rounded-full bg-white"
            style={{
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              opacity: 0.85,
            }}
            initial={{ y: -10, x: 0 }}
            animate={{ y: '110vh', x: f.drift }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              delay: f.delay,
              ease: 'linear',
            }}
          />
        ))}

      {/* Mist overlay */}
      {theme === 'mist' && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
};

export const WeatherEffects = memo(WeatherEffectsImpl);
