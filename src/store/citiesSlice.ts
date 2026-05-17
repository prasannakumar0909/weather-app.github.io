import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SavedCity, TemperatureUnit } from '@/types/weather';

export const MAX_CITIES = 5;

interface CitiesState {
  cities: SavedCity[];
  primaryId: string | null;
  unit: TemperatureUnit;
  hasGeoConsent: boolean;
}

const STORAGE_KEY = 'forecast-weather-state-v1';

const loadInitial = (): CitiesState => {
  if (typeof window === 'undefined') {
    return { cities: [], primaryId: null, unit: 'metric', hasGeoConsent: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CitiesState;
  } catch {
    // Ignore malformed persisted state
  }
  return { cities: [], primaryId: null, unit: 'metric', hasGeoConsent: false };
};

const initialState: CitiesState = loadInitial();

const persist = (state: CitiesState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be full or disabled (private mode); fail silently.
  }
};

const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    addCity: (state, action: PayloadAction<SavedCity>) => {
      // Prevent duplicates by id
      if (state.cities.some((c) => c.id === action.payload.id)) return;
      // Enforce hard cap
      if (state.cities.length >= MAX_CITIES) return;
      state.cities.push(action.payload);
      if (!state.primaryId) state.primaryId = action.payload.id;
      persist(state);
    },
    removeCity: (state, action: PayloadAction<string>) => {
      state.cities = state.cities.filter((c) => c.id !== action.payload);
      if (state.primaryId === action.payload) {
        state.primaryId = state.cities[0]?.id ?? null;
      }
      persist(state);
    },
    setPrimary: (state, action: PayloadAction<string>) => {
      if (state.cities.some((c) => c.id === action.payload)) {
        state.primaryId = action.payload;
        persist(state);
      }
    },
    setUnit: (state, action: PayloadAction<TemperatureUnit>) => {
      state.unit = action.payload;
      persist(state);
    },
    setGeoConsent: (state, action: PayloadAction<boolean>) => {
      state.hasGeoConsent = action.payload;
      persist(state);
    },
    reorderCities: (state, action: PayloadAction<SavedCity[]>) => {
      state.cities = action.payload;
      persist(state);
    },
  },
});

export const {
  addCity,
  removeCity,
  setPrimary,
  setUnit,
  setGeoConsent,
  reorderCities,
} = citiesSlice.actions;

export default citiesSlice.reducer;
