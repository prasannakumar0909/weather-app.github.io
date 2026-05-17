import { screen, fireEvent, waitFor } from '@testing-library/react';
import { NoState } from './NoState';
import { renderWithProviders } from '@/utils/test-utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import toast from 'react-hot-toast';

// Mock geolocation hook
jest.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: jest.fn(),
}));

describe('NoState component', () => {
  const mockRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useGeolocation as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      request: mockRequest,
    });
  });

  it('renders onboarding welcome elements', () => {
    renderWithProviders(<NoState />);

    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getByText('Forecast')).toBeInTheDocument();
    expect(screen.getByText(/Begin with your current location/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use My Location' })).toBeInTheDocument();
  });

  it('shows loading indicator when location request is in progress', () => {
    (useGeolocation as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      request: mockRequest,
    });

    renderWithProviders(<NoState />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Locating')).toBeInTheDocument();
  });

  it('successfully locates user, adds city to Redux, and displays success toast', async () => {
    const mockCity = {
      id: 'geo-12.345-67.890',
      lat: 12.345,
      lon: 67.890,
      country: 'US',
      displayName: 'Located City',
      addedAt: 1234567,
    };
    mockRequest.mockResolvedValue(mockCity);

    const { store } = renderWithProviders(<NoState />);
    const button = screen.getByRole('button', { name: 'Use My Location' });

    fireEvent.click(button);

    expect(mockRequest).toHaveBeenCalled();

    await waitFor(() => {
      // Assert Redux state updates
      expect(store.getState().cities.cities).toHaveLength(1);
      expect(store.getState().cities.cities[0]).toEqual(mockCity);
      expect(store.getState().cities.hasGeoConsent).toBe(true);

      // Assert toast success was called
      expect(toast.success).toHaveBeenCalledWith('Located: Located City');
    });
  });

  it('displays error toast when location request returns null', async () => {
    mockRequest.mockResolvedValue(null);

    const { store } = renderWithProviders(<NoState />);
    const button = screen.getByRole('button', { name: 'Use My Location' });

    fireEvent.click(button);

    expect(mockRequest).toHaveBeenCalled();

    await waitFor(() => {
      // Redux store cities should remain empty
      expect(store.getState().cities.cities).toHaveLength(0);

      // Assert toast error was called
      expect(toast.error).toHaveBeenCalledWith('Location unavailable. Try adding a ZIP code instead.');
    });
  });
});
