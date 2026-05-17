import React from 'react';
import { render, screen } from '@testing-library/react';
import { WeatherIcon } from './WeatherIcon';

// Mock lucide-react icons for precise and reliable unit testing
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    CloudLightning: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-lightning' }),
    CloudDrizzle: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-drizzle' }),
    CloudRain: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-rain' }),
    CloudSnow: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-snow' }),
    CloudFog: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-fog' }),
    Cloud: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-cloud' }),
    Cloudy: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-cloudy' }),
    Moon: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-moon' }),
    Sun: (props: any) => React.createElement('div', { ...props, 'data-testid': 'icon-sun' }),
  };
});

describe('WeatherIcon component', () => {
  it('renders Lightning icon for thunderstorm conditions', () => {
    render(<WeatherIcon condition="Thunderstorm" />);
    expect(screen.getByTestId('icon-lightning')).toBeInTheDocument();
  });

  it('renders Drizzle icon for drizzle conditions', () => {
    render(<WeatherIcon condition="Light Drizzle" />);
    expect(screen.getByTestId('icon-drizzle')).toBeInTheDocument();
  });

  it('renders Rain icon for rain conditions', () => {
    render(<WeatherIcon condition="Heavy Rain" />);
    expect(screen.getByTestId('icon-rain')).toBeInTheDocument();
  });

  it('renders Snow icon for snow conditions', () => {
    render(<WeatherIcon condition="Snow Shower" />);
    expect(screen.getByTestId('icon-snow')).toBeInTheDocument();
  });

  it('renders Fog icon for mist, fog, haze, smoke conditions', () => {
    const { rerender } = render(<WeatherIcon condition="Mist" />);
    expect(screen.getByTestId('icon-fog')).toBeInTheDocument();

    rerender(<WeatherIcon condition="Foggy" />);
    expect(screen.getByTestId('icon-fog')).toBeInTheDocument();

    rerender(<WeatherIcon condition="Haze" />);
    expect(screen.getByTestId('icon-fog')).toBeInTheDocument();

    rerender(<WeatherIcon condition="Smoke" />);
    expect(screen.getByTestId('icon-fog')).toBeInTheDocument();
  });

  it('renders Cloudy icon for standard cloudy conditions, and Cloud for few clouds', () => {
    const { rerender } = render(<WeatherIcon condition="Scattered Clouds" />);
    expect(screen.getByTestId('icon-cloudy')).toBeInTheDocument();

    rerender(<WeatherIcon condition="Few Clouds" />);
    expect(screen.getByTestId('icon-cloud')).toBeInTheDocument();
  });

  it('renders Sun or Moon icon for clear conditions based on isNight flag', () => {
    const { rerender } = render(<WeatherIcon condition="Clear Sky" isNight={false} />);
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument();

    rerender(<WeatherIcon condition="Clear Sky" isNight={true} />);
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
  });

  it('falls back to default Cloud icon for unknown conditions', () => {
    render(<WeatherIcon condition="Tornado" />);
    expect(screen.getByTestId('icon-cloud')).toBeInTheDocument();
  });
});
