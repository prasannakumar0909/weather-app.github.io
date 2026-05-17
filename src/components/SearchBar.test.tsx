import { screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchBar } from './SearchBar';
import { renderWithProviders } from '@/utils/test-utils';
import { lookupZip } from '@/api/weather';
import toast from 'react-hot-toast';

// Mock weather lookup API
jest.mock('@/api/weather', () => ({
  lookupZip: jest.fn(),
}));


describe('SearchBar component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  const mockResolvedZip = {
    zip: '94103',
    name: 'San Francisco',
    lat: 37.7749,
    lon: -122.4194,
    country: 'US',
  };

  it('renders search input and button', () => {
    renderWithProviders(<SearchBar />);

    expect(
      screen.getByPlaceholderText(/Add up to 5 ZIPs — separate with commas/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('does not submit when input is empty or just whitespace', () => {
    renderWithProviders(<SearchBar />);
    const input = screen.getByLabelText(/ZIP or postal codes/i);
    const submitBtn = screen.getByRole('button', { name: 'Add' });

    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: '   ' } });
    expect(submitBtn).toBeDisabled();
  });

  it('successfully adds a single ZIP code and updates Redux state', async () => {
    (lookupZip as jest.Mock).mockResolvedValue(mockResolvedZip);

    const { store } = renderWithProviders(<SearchBar />);
    const input = screen.getByLabelText(/ZIP or postal codes/i);
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: '94103' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      // API call made
      expect(lookupZip).toHaveBeenCalledWith('94103', 'US');

      // Dispatch occurred
      expect(store.getState().cities.cities).toHaveLength(1);
      expect(store.getState().cities.cities[0].displayName).toBe('San Francisco');

      // Toast triggered and input cleared
      expect(toast.success).toHaveBeenCalledWith('Added San Francisco');
      expect(input).toHaveValue('');
    });
  });

  it('adds multiple comma-separated ZIPs in parallel', async () => {
    (lookupZip as jest.Mock)
      .mockResolvedValueOnce({
        zip: '94103',
        name: 'San Francisco',
        lat: 37.7749,
        lon: -122.4194,
        country: 'US',
      })
      .mockResolvedValueOnce({
        zip: '10001',
        name: 'New York',
        lat: 40.7128,
        lon: -74.006,
        country: 'US',
      });

    const { store } = renderWithProviders(<SearchBar />);
    const input = screen.getByLabelText(/ZIP or postal codes/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '94103, 10001' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(lookupZip).toHaveBeenCalledTimes(2);
      expect(store.getState().cities.cities).toHaveLength(2);
      expect(toast.success).toHaveBeenCalledWith('Added 2 cities: San Francisco, New York');
      expect(input).toHaveValue('');
    });
  });

  it('does not search and shows error if dashboard is full', async () => {
    const existingCities = Array.from({ length: 5 }, (_, i) => ({
      id: `zip-US-${i}`,
      zip: `9000${i}`,
      country: 'US',
      lat: 34.05,
      lon: -118.24,
      displayName: `City ${i}`,
      addedAt: Date.now(),
    }));

    renderWithProviders(<SearchBar />, {
      preloadedState: {
        cities: {
          cities: existingCities,
          primaryId: 'zip-US-0',
          unit: 'metric',
          hasGeoConsent: false,
        },
      },
    });

    const input = screen.getByPlaceholderText(/Dashboard full/i);
    const submitBtn = screen.getByRole('button');

    expect(input).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // programmatically submit form to test early-return branch
    const form = input.closest('form')!;
    fireEvent.change(input, { target: { value: '94103' } });
    fireEvent.submit(form);

    expect(toast.error).toHaveBeenCalledWith('Dashboard full — 5/5 cities. Remove one to add more.');
    expect(lookupZip).not.toHaveBeenCalled();
  });

  it('warns and caps processing when input count exceeds available slots', async () => {
    const existingCities = Array.from({ length: 3 }, (_, i) => ({
      id: `zip-US-${i}`,
      zip: `9000${i}`,
      country: 'US',
      lat: 34.05,
      lon: -118.24,
      displayName: `City ${i}`,
      addedAt: Date.now(),
    }));

    // 3 cities present, 2 slots remaining. Paste 3 new ZIPs.
    (lookupZip as jest.Mock)
      .mockResolvedValueOnce({ zip: '10001', name: 'New York', lat: 40, lon: -74, country: 'US' })
      .mockResolvedValueOnce({ zip: '10002', name: 'Brooklyn', lat: 40.1, lon: -74.1, country: 'US' });

    const { store } = renderWithProviders(<SearchBar />, {
      preloadedState: {
        cities: {
          cities: existingCities,
          primaryId: 'zip-US-0',
          unit: 'metric',
          hasGeoConsent: false,
        },
      },
    });

    const input = screen.getByLabelText(/ZIP or postal codes/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '10001, 10002, 10003' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      // Should show warning toast for slots
      expect(toast).toHaveBeenCalledWith('Only 2 slots left — processing the first 2.', { icon: '⚠️' });

      // Should only fire 2 lookups
      expect(lookupZip).toHaveBeenCalledTimes(2);
      expect(lookupZip).not.toHaveBeenCalledWith('10003', 'US');

      // Adds both to store
      expect(store.getState().cities.cities).toHaveLength(5);
    });
  });

  it('handles duplicate city additions gracefully', async () => {
    const existingCity = {
      id: 'zip-US-94103',
      zip: '94103',
      country: 'US',
      lat: 37.77,
      lon: -122.41,
      displayName: 'San Francisco',
      addedAt: Date.now(),
    };

    (lookupZip as jest.Mock).mockResolvedValue(mockResolvedZip);

    renderWithProviders(<SearchBar />, {
      preloadedState: {
        cities: {
          cities: [existingCity],
          primaryId: 'zip-US-94103',
          unit: 'metric',
          hasGeoConsent: false,
        },
      },
    });

    const input = screen.getByLabelText(/ZIP or postal codes/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '94103' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(lookupZip).toHaveBeenCalled();
      // Should show duplicate warning
      expect(toast).toHaveBeenCalledWith('San Francisco is already on your dashboard.', { icon: '↩️' });
      // Input is not cleared so user can change it
      expect(input).toHaveValue('94103');
    });
  });

  it('handles lookup API errors by showing error toasts', async () => {
    (lookupZip as jest.Mock).mockRejectedValue(new Error('Zip code not found.'));

    renderWithProviders(<SearchBar />);
    const input = screen.getByLabelText(/ZIP or postal codes/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: '99999' } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(lookupZip).toHaveBeenCalledWith('99999', 'US');
      // Toast error shown
      expect(toast.error).toHaveBeenCalledWith('99999: Zip code not found.');
      // Input retained for editing
      expect(input).toHaveValue('99999');
    });
  });
});
