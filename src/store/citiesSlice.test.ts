import citiesReducer, {
  addCity,
  removeCity,
  setPrimary,
  setUnit,
  setGeoConsent,
  reorderCities,
  MAX_CITIES,
} from './citiesSlice';
import type { SavedCity } from '@/types/weather';

const STORAGE_KEY = 'forecast-weather-state-v1';

describe('cities slice', () => {
  let mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        clear: () => {
          mockLocalStorage = {};
        },
        removeItem: (key: string) => {
          delete mockLocalStorage[key];
        },
      },
      writable: true,
    });
  });

  const sampleCity1: SavedCity = {
    id: 'zip-US-94103',
    zip: '94103',
    country: 'US',
    lat: 37.7749,
    lon: -122.4194,
    displayName: 'San Francisco',
    addedAt: 1000,
  };

  const sampleCity2: SavedCity = {
    id: 'zip-US-10001',
    zip: '10001',
    country: 'US',
    lat: 40.7128,
    lon: -74.006,
    displayName: 'New York',
    addedAt: 2000,
  };

  it('should return the initial state when storage is empty', () => {
    const state = citiesReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      cities: [],
      primaryId: null,
      unit: 'metric',
      hasGeoConsent: false,
    });
  });

  it('should load initial state from localStorage if available', () => {
    const savedState = {
      cities: [sampleCity1],
      primaryId: 'zip-US-94103',
      unit: 'imperial' as const,
      hasGeoConsent: true,
    };
    mockLocalStorage[STORAGE_KEY] = JSON.stringify(savedState);

    let isolatedReducer: any;
    jest.isolateModules(() => {
      const slice = require('./citiesSlice');
      isolatedReducer = slice.default;
    });

    const state = isolatedReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(savedState);
  });

  it('should return initial state when window is undefined (e.g. server-side rendering)', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    let isolatedReducer: any;
    jest.isolateModules(() => {
      const slice = require('./citiesSlice');
      isolatedReducer = slice.default;
    });

    // Restore window
    global.window = originalWindow;

    const state = isolatedReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      cities: [],
      primaryId: null,
      unit: 'metric',
      hasGeoConsent: false,
    });
  });

  it('should add a city and set as primary if it is the first city', () => {
    const initialState = {
      cities: [],
      primaryId: null,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, addCity(sampleCity1));
    expect(nextState.cities).toHaveLength(1);
    expect(nextState.cities[0]).toEqual(sampleCity1);
    expect(nextState.primaryId).toBe(sampleCity1.id);

    // Verify persistence
    expect(JSON.parse(mockLocalStorage[STORAGE_KEY])).toEqual(nextState);
  });

  it('should not set as primary on adding city if a primary city already exists', () => {
    const initialState = {
      cities: [sampleCity1],
      primaryId: sampleCity1.id,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, addCity(sampleCity2));
    expect(nextState.cities).toHaveLength(2);
    expect(nextState.primaryId).toBe(sampleCity1.id);
  });

  it('should not add duplicate cities', () => {
    const initialState = {
      cities: [sampleCity1],
      primaryId: sampleCity1.id,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, addCity(sampleCity1));
    expect(nextState.cities).toHaveLength(1);
  });

  it('should not exceed MAX_CITIES cap', () => {
    const initialCities = Array.from({ length: MAX_CITIES }, (_, i) => ({
      ...sampleCity1,
      id: `city-${i}`,
    }));

    const initialState = {
      cities: initialCities,
      primaryId: 'city-0',
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, addCity(sampleCity2));
    expect(nextState.cities).toHaveLength(MAX_CITIES);
    expect(nextState.cities.some((c) => c.id === sampleCity2.id)).toBe(false);
  });

  it('should remove a city and update primaryId if removed city was primary', () => {
    const initialState = {
      cities: [sampleCity1, sampleCity2],
      primaryId: sampleCity1.id,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, removeCity(sampleCity1.id));
    expect(nextState.cities).toHaveLength(1);
    expect(nextState.cities[0].id).toBe(sampleCity2.id);
    expect(nextState.primaryId).toBe(sampleCity2.id);
  });

  it('should set primaryId only if the city is in the list', () => {
    const initialState = {
      cities: [sampleCity1],
      primaryId: sampleCity1.id,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    // Attempting to set an invalid primary ID
    const nextState = citiesReducer(initialState, setPrimary('invalid-id'));
    expect(nextState.primaryId).toBe(sampleCity1.id);

    // Setting a valid primary ID
    const stateWithTwo = { ...initialState, cities: [sampleCity1, sampleCity2] };
    const nextState2 = citiesReducer(stateWithTwo, setPrimary(sampleCity2.id));
    expect(nextState2.primaryId).toBe(sampleCity2.id);
  });

  it('should update temperature unit', () => {
    const initialState = {
      cities: [],
      primaryId: null,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, setUnit('imperial'));
    expect(nextState.unit).toBe('imperial');
  });

  it('should update geo consent status', () => {
    const initialState = {
      cities: [],
      primaryId: null,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const nextState = citiesReducer(initialState, setGeoConsent(true));
    expect(nextState.hasGeoConsent).toBe(true);
  });

  it('should reorder cities list', () => {
    const initialState = {
      cities: [sampleCity1, sampleCity2],
      primaryId: sampleCity1.id,
      unit: 'metric' as const,
      hasGeoConsent: false,
    };

    const reordered = [sampleCity2, sampleCity1];
    const nextState = citiesReducer(initialState, reorderCities(reordered));
    expect(nextState.cities).toEqual(reordered);
  });
});
