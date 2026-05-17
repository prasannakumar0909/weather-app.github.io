import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Cloudy,
  Moon,
  Sun,
  LucideProps,
} from 'lucide-react';

interface Props extends LucideProps {
  condition: string; // e.g. "Clear", "Rain"
  isNight?: boolean;
}

export const WeatherIcon = ({ condition, isNight, ...rest }: Props) => {
  const c = condition.toLowerCase();

  if (c.includes('thunder')) return <CloudLightning {...rest} />;
  if (c.includes('drizzle')) return <CloudDrizzle {...rest} />;
  if (c.includes('rain')) return <CloudRain {...rest} />;
  if (c.includes('snow')) return <CloudSnow {...rest} />;
  if (c.includes('mist') || c.includes('fog') || c.includes('haze') || c.includes('smoke')) {
    return <CloudFog {...rest} />;
  }
  if (c.includes('cloud')) return c.includes('few') ? <Cloud {...rest} /> : <Cloudy {...rest} />;
  if (c.includes('clear')) return isNight ? <Moon {...rest} /> : <Sun {...rest} />;
  return <Cloud {...rest} />;
};
