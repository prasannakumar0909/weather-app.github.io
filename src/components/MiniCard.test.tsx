import { screen, fireEvent } from '@testing-library/react';
import { MiniCard } from './MiniCard';
import { renderWithProviders } from '@/utils/test-utils';
import { useCurrentWeather } from '@/hooks/useWeather';

// Mock the weather query hook
jest.mock('@/hooks/useWeather', () => ({
  useCurrentWeather: jest.fn(),
}));

describe('MiniCard component', () => {
  const mockCity = {
    id: 'zip-US-94103',
    zip: '94103',
    country: 'US',
    lat: 37.77,
    lon: -122.41,
    displayName: 'San Francisco',
    addedAt: Date.now(),
  };

  const mockWeatherData = {
    dt: 1620000000,
    sys: { country: 'US', sunrise: 1619980000, sunset: 1620020000 },
    weather: [{ main: 'Clear', description: 'clear sky' }],
    main: { temp: 23.4 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading placeholder state', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<MiniCard city={mockCity} unit="metric" isActive={false} />);

    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('US')).toBeInTheDocument();
    // Pulse loading skeleton is rendered (which has no text, but we can verify it's there)
    expect(screen.queryByText('clear sky')).not.toBeInTheDocument();
  });

  it('renders failed to load error state', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<MiniCard city={mockCity} unit="metric" isActive={false} />);

    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders weather data successfully when query is loaded', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<MiniCard city={mockCity} unit="metric" isActive={false} />);

    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('23°')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });

  it('renders primary badge when card is active', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<MiniCard city={mockCity} unit="metric" isActive={true} />);

    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('dispatches setPrimary action when clicked and not active', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    const { store } = renderWithProviders(
      <MiniCard city={mockCity} unit="metric" isActive={false} />,
      {
        preloadedState: {
          cities: {
            cities: [mockCity],
            primaryId: null,
            unit: 'metric',
            hasGeoConsent: false,
          },
        },
      }
    );

    const cardButton = screen.getByRole('button', { name: /View San Francisco/i });
    fireEvent.click(cardButton);

    // Verify primaryId in store is updated
    expect(store.getState().cities.primaryId).toBe(mockCity.id);
  });

  it('does not dispatch setPrimary when card is already active', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    const { store } = renderWithProviders(
      <MiniCard city={mockCity} unit="metric" isActive={true} />,
      {
        preloadedState: {
          cities: {
            cities: [mockCity],
            primaryId: mockCity.id,
            unit: 'metric',
            hasGeoConsent: false,
          },
        },
      }
    );

    const cardButton = screen.getByRole('button', { name: /View San Francisco/i });
    fireEvent.click(cardButton);

    // Should still be primaryId
    expect(store.getState().cities.primaryId).toBe(mockCity.id);
  });

  it('dispatches removeCity action when X button is clicked', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    const { store } = renderWithProviders(
      <MiniCard city={mockCity} unit="metric" isActive={false} />,
      {
        preloadedState: {
          cities: {
            cities: [mockCity],
            primaryId: null,
            unit: 'metric',
            hasGeoConsent: false,
          },
        },
      }
    );

    const removeBtn = screen.getByRole('button', { name: /Remove San Francisco/i });
    fireEvent.click(removeBtn);

    // Verify city was removed from Redux store
    expect(store.getState().cities.cities).toHaveLength(0);
  });

  it('dispatches removeCity action when Enter key is pressed on remove button', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    const { store } = renderWithProviders(
      <MiniCard city={mockCity} unit="metric" isActive={false} />,
      {
        preloadedState: {
          cities: {
            cities: [mockCity],
            primaryId: null,
            unit: 'metric',
            hasGeoConsent: false,
          },
        },
      }
    );

    const removeBtn = screen.getByRole('button', { name: /Remove San Francisco/i });
    fireEvent.keyDown(removeBtn, { key: 'Enter' });

    expect(store.getState().cities.cities).toHaveLength(0);
  });

  it('dispatches removeCity action when Space key is pressed on remove button', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    const { store } = renderWithProviders(
      <MiniCard city={mockCity} unit="metric" isActive={false} />,
      {
        preloadedState: {
          cities: {
            cities: [mockCity],
            primaryId: null,
            unit: 'metric',
            hasGeoConsent: false,
          },
        },
      }
    );

    const removeBtn = screen.getByRole('button', { name: /Remove San Francisco/i });
    fireEvent.keyDown(removeBtn, { key: ' ' });

    expect(store.getState().cities.cities).toHaveLength(0);
  });

  it('does not dispatch removeCity when other keys are pressed on remove button', () => {
    (useCurrentWeather as jest.Mock).mockReturnValue({
      data: mockWeatherData,
      isLoading: false,
      isError: false,
    });

    const { store } = renderWithProviders(
      <MiniCard city={mockCity} unit="metric" isActive={false} />,
      {
        preloadedState: {
          cities: {
            cities: [mockCity],
            primaryId: null,
            unit: 'metric',
            hasGeoConsent: false,
          },
        },
      }
    );

    const removeBtn = screen.getByRole('button', { name: /Remove San Francisco/i });
    fireEvent.keyDown(removeBtn, { key: 'Escape' });

    expect(store.getState().cities.cities).toHaveLength(1);
  });
});
