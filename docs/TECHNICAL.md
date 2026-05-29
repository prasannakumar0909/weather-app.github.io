# Forecast Weather App — Technical Documentation

This document covers the architecture, integration patterns, performance considerations, and security posture of the Forecast codebase.

---

## 1. Architecture Overview

Forecast is a React + Vite frontend backed by a Spring Boot proxy backend.

The frontend is responsible for the UI, local persistence, and browser geolocation.
The backend is responsible for forwarding OpenWeatherMap requests and keeping the raw API key off the client.

```
┌────────────────────────────────────┐
│           React Frontend           │
│  Dashboard → SearchBar → HeroCard  │
└───────────────┬────────────────────┘
                │
                │ Redux Toolkit / React Query
                ▼
┌───────────────┴────────────────────┐
│          Browser localStorage       │
│ (cities, primaryId, unit, geo consent)
└───────────────┬────────────────────┘
                │
                │ Axios proxy calls to /api
                ▼
┌────────────────────────────────────┐
│        Spring Boot backend proxy    │
│ /api/geo/zip, /api/weather, /api/forecast
└────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────┐
│         OpenWeatherMap API         │
│  /geo/zip, /weather, /forecast     │
└────────────────────────────────────┘
```

### Why two state systems?

- **Redux Toolkit** stores the user's saved city list, selected primary city, unit preference, and geolocation consent.
- **React Query** manages fetched weather payloads, caching them with stale and garbage collection policies.

Separating user state from server state reduces synchronization complexity and keeps each layer focused.

---

## 2. Data Flow

### 2.1 Add-city flow

```
User submits ZIP input
   ↓
SearchBar.onSubmit
   ↓
lookupZip(zip, country) → /api/geo/zip
   ↓
Backend proxies request to OpenWeatherMap
   ↓
Resolved { name, lat, lon, country }
   ↓
dispatch(addCity({...}))
   ↓
Redux state updates and persists to localStorage
   ↓
Dashboard renders new MiniCard
   ↓
MiniCard and primary Hero query weather via React Query
```

### 2.2 Primary selection flow

```
User clicks MiniCard
   ↓
dispatch(setPrimary(cityId))
   ↓
primaryCity recomputes in Dashboard
   ↓
HeroCard and forecasts render for the new city
   ↓
DynamicBackground theme updates
```

### 2.3 Unit toggle flow

```
User clicks °C / °F
   ↓
dispatch(setUnit(newUnit))
   ↓
Query keys change for all weather queries
   ↓
React Query fetches fresh data for each city in the new unit
   ↓
Previous-unit data stays cached for quick toggling
```

---

## 3. Module Responsibilities

### 3.1 `src/api/client.ts`

- Creates a shared Axios instance with `baseURL` taken from `VITE_API_BASE_URL` (default `/api`).
- Normalizes backend errors into user-facing `Error` messages.
- Handles 401, 404, 429, and timeout cases cleanly.

### 3.2 `src/api/weather.ts`

- Exposes pure async functions:
  - `lookupZip(zip, country)` → `/geo/zip`
  - `fetchCurrentWeather(lat, lon, units)` → `/weather`
  - `fetchForecast(lat, lon, units)` → `/forecast`
- Does not depend on React, so it is easy to mock and unit test.

### 3.3 `backend/src/main/java/com/example/weather/service/OpenWeatherService.java`

- Constructs backend requests to OpenWeatherMap.
- Appends `appid` from `OPENWEATHERMAP_API_KEY`.
- Forwards query params for zip, lat/lon, and units.

### 3.4 `backend/src/main/java/com/example/weather/controller/WeatherController.java`

- Exposes `/api/geo/zip`, `/api/weather`, and `/api/forecast`.
- Forwards HTTP errors from OpenWeatherMap back to the frontend.

### 3.5 `src/store/citiesSlice.ts`

- Manages saved cities with a hard cap of five.
- Prevents duplicate IDs.
- Updates `primaryId` automatically when the primary city is removed.
- Persists every state mutation to `localStorage`.

### 3.6 `src/hooks/useWeather.ts`

- `useCurrentWeather(city, unit)` and `useForecast(city, unit)` wrap React Query.
- Both use `staleTime: 10 minutes` and `gcTime: 30 minutes`.
- Queries are disabled until valid coordinates exist.

### 3.7 `src/hooks/useGeolocation.ts`

- Wraps `navigator.geolocation.getCurrentPosition` in a Promise.
- Converts browser geolocation errors into clear messages.

### 3.8 `src/components/Dashboard.tsx`

- Coordinates the main layout and theme.
- Attempts a silent geolocation lookup once when there are no saved cities and permission is already granted.
- Renders `NoState` when the dashboard is empty.

---

## 4. API Integration Strategy

### 4.1 Endpoints

| Endpoint | Purpose | Notes |
| --- | --- | --- |
| `/api/geo/zip` | Resolve ZIP/postal code to coordinates | Uses OpenWeatherMap geocoding proxy |
| `/api/weather` | Current weather for coordinates | Proxied from OpenWeatherMap `/weather` |
| `/api/forecast` | 5-day forecast for coordinates | Proxied from OpenWeatherMap `/forecast` |

### 4.2 Authentication

- The backend reads `OPENWEATHERMAP_API_KEY` from environment variables.
- The frontend only uses `VITE_API_BASE_URL` to talk to `/api`.
- The raw API key never appears in client code or browser requests.

### 4.3 Error handling

- Backend returns OpenWeatherMap status codes unchanged.
- `src/api/client.ts` converts them into readable error messages.
- UI components render toast messages directly from `Error.message`.

### 4.4 Caching

- React Query caches current weather and forecast responses for 10 minutes.
- Garbage collection removes unused cache entries after 30 minutes.
- Local storage only persists the saved city list and preferences, not weather payloads.

---

## 5. Persistence and state

- Saved city state is stored under `forecast-weather-state-v1` in `localStorage`.
- Persisted fields:
  - `cities`
  - `primaryId`
  - `unit`
  - `hasGeoConsent`
- If `localStorage` is unavailable or malformed, the app falls back gracefully to the default state.

---

## 6. Performance

### 6.1 Query behavior

- Queries do not refetch on window focus by default.
- Retry is limited to 1 attempt.
- Request timeouts are set to 10 seconds.

### 6.2 Rendering

- `WeatherEffects` is memoized.
- `DynamicBackground` is managed separately from content, minimizing reflows.
- `motion.div` `layout` props keep reorder animations smooth.

---

## 7. Security

- `OPENWEATHERMAP_API_KEY` is required for backend startup.
- The backend proxies OpenWeatherMap requests and hides the API key from the client.
- The frontend uses only safe React rendering patterns and does not use `dangerouslySetInnerHTML`.
- No analytics or third-party tracking is included.

---

## 8. Testing guidance

- `src/api/weather.ts` can be unit tested by mocking Axios.
- `citiesSlice.ts` reducers are straightforward reducer tests.
- `useWeather.ts` and `useGeolocation.ts` are good candidates for hook tests.
- `Dashboard`, `SearchBar`, `HeroCard`, and forecast components are good targets for integration tests with mocked API responses.

---

## 9. Backend notes

- The backend is a Spring Boot app in `backend/`.
- It builds with Maven and serves the frontend static assets from `backend/src/main/resources/static`.
- The root `Dockerfile` first builds the frontend, then copies the production build into the backend static folder, and finally packages the Spring Boot jar.

---

