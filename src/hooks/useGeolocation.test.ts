import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';
import { geoClient } from '@/api/client';

// Mock the API client
jest.mock('@/api/client', () => ({
  geoClient: {
    get: jest.fn(),
  },
}));

describe('useGeolocation hook', () => {
  const originalGeolocation = global.navigator.geolocation;

  beforeEach(() => {
    jest.resetAllMocks();
    // Clear geolocation mock by deleting the property
    delete (global.navigator as any).geolocation;
  });

  afterAll(() => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true,
    });
  });

  const setupGeolocationMock = (
    getCurrentPositionMock: (
      success: PositionCallback,
      error?: PositionErrorCallback | null,
      options?: PositionOptions
    ) => void
  ) => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: getCurrentPositionMock,
      },
      writable: true,
      configurable: true,
    });
  };

  it('should return unsupported browser error if navigator.geolocation is missing', async () => {
    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toBeNull();
    expect(result.current.error).toBe('Geolocation is not supported by your browser.');
    expect(result.current.loading).toBe(false);
  });

  it('should successfully get location and perform reverse geocoding', async () => {
    const coords = { latitude: 37.7749, longitude: -122.4194 };
    const position = { coords, timestamp: Date.now() };

    const getCurrentPositionMock = jest.fn().mockImplementation((success) => {
      success(position);
    });
    setupGeolocationMock(getCurrentPositionMock);

    // Mock successful reverse geocode
    (geoClient.get as jest.Mock).mockResolvedValue({
      data: [
        {
          name: 'San Francisco',
          state: 'California',
          country: 'US',
          lat: 37.7749,
          lon: -122.4194,
        },
      ],
    });

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(getCurrentPositionMock).toHaveBeenCalled();
    expect(geoClient.get).toHaveBeenCalledWith('/reverse', {
      params: { lat: 37.7749, lon: -122.4194, limit: 1 },
    });

    expect(city).toEqual({
      id: expect.stringMatching(/^geo-37.775--122.419$/),
      lat: 37.7749,
      lon: -122.4194,
      country: 'US',
      displayName: 'San Francisco, California',
      addedAt: expect.any(Number),
    });
    expect(result.current.error).toBeNull();
  });

  it('should successfully get location and use name only if state is missing in reverse geocode', async () => {
    const coords = { latitude: 37.7749, longitude: -122.4194 };
    const position = { coords, timestamp: Date.now() };

    const getCurrentPositionMock = jest.fn().mockImplementation((success) => {
      success(position);
    });
    setupGeolocationMock(getCurrentPositionMock);

    // Mock successful reverse geocode without state
    (geoClient.get as jest.Mock).mockResolvedValue({
      data: [
        {
          name: 'San Francisco',
          country: 'US',
          lat: 37.7749,
          lon: -122.4194,
        },
      ],
    });

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toEqual({
      id: expect.stringMatching(/^geo-37.775--122.419$/),
      lat: 37.7749,
      lon: -122.4194,
      country: 'US',
      displayName: 'San Francisco',
      addedAt: expect.any(Number),
    });
    expect(result.current.error).toBeNull();
  });

  it('should fallback to coordinates if reverse geocode returns empty data', async () => {
    const coords = { latitude: 37.7749, longitude: -122.4194 };
    const position = { coords, timestamp: Date.now() };

    const getCurrentPositionMock = jest.fn().mockImplementation((success) => {
      success(position);
    });
    setupGeolocationMock(getCurrentPositionMock);

    // Mock reverse geocode empty data
    (geoClient.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toEqual({
      id: expect.stringMatching(/^geo-37.775--122.419$/),
      lat: 37.7749,
      lon: -122.4194,
      country: '',
      displayName: 'Near (37.77, -122.42)',
      addedAt: expect.any(Number),
    });
    expect(result.current.error).toBeNull();
  });

  it('should fallback to coordinates display name if reverse geocoding fails', async () => {
    const coords = { latitude: 37.7749, longitude: -122.4194 };
    const position = { coords, timestamp: Date.now() };

    const getCurrentPositionMock = jest.fn().mockImplementation((success) => {
      success(position);
    });
    setupGeolocationMock(getCurrentPositionMock);

    // Mock reverse geocode failure
    (geoClient.get as jest.Mock).mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toEqual({
      id: expect.stringMatching(/^geo-37.775--122.419$/),
      lat: 37.7749,
      lon: -122.4194,
      country: '',
      displayName: 'Near (37.77, -122.42)',
      addedAt: expect.any(Number),
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle geolocation permission denied error', async () => {
    const getCurrentPositionMock = jest.fn().mockImplementation((success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });
    setupGeolocationMock(getCurrentPositionMock);

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toBeNull();
    expect(result.current.error).toBe('Permission denied. Try searching by zip instead.');
  });

  it('should handle geolocation position unavailable error', async () => {
    const getCurrentPositionMock = jest.fn().mockImplementation((success, error) => {
      error({
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });
    setupGeolocationMock(getCurrentPositionMock);

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toBeNull();
    expect(result.current.error).toBe('Position unavailable.');
  });

  it('should handle geolocation timeout error', async () => {
    const getCurrentPositionMock = jest.fn().mockImplementation((success, error) => {
      error({
        code: 3, // TIMEOUT
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });
    setupGeolocationMock(getCurrentPositionMock);

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toBeNull();
    expect(result.current.error).toBe('Location request timed out.');
  });

  it('should handle generic geolocation errors', async () => {
    const getCurrentPositionMock = jest.fn().mockImplementation((success, error) => {
      error(new Error('Unknown hardware error'));
    });
    setupGeolocationMock(getCurrentPositionMock);

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toBeNull();
    expect(result.current.error).toBe('Unknown hardware error');
  });

  it('should handle geolocation other code errors', async () => {
    const getCurrentPositionMock = jest.fn().mockImplementation((success, error) => {
      error({
        code: 4,
        message: 'Other error',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      });
    });
    setupGeolocationMock(getCurrentPositionMock);

    const { result } = renderHook(() => useGeolocation());

    let city;
    await act(async () => {
      city = await result.current.request();
    });

    expect(city).toBeNull();
    expect(result.current.error).toBe('Could not get your location.');
  });
});
