# Forecast Weather App— Technical Documentation

This document covers the architecture, integration patterns, performance considerations, and security posture of the Forecast codebase.

---

## 1. Architecture Overview

Forecast is a single-page React application with no backend of its own. All weather data is fetched directly from OpenWeatherMap's REST API from the browser. Client state and server state are managed separately and intentionally:

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                     │
│  Dashboard ─ HeroCard ─ MiniCard ─ Forecasts ─ Search   │
└──────┬───────────────────────────────────┬──────────────┘
       │                                   │
       │ useAppSelector / dispatch         │ useQuery
       ▼                                   ▼
┌──────────────┐                  ┌──────────────────┐
│ Redux Store  │                  │  React Query     │
│ (city list,  │                  │  (server cache,  │
│  primary,    │                  │   weather data)  │
│  unit pref)  │                  └────────┬─────────┘
└──────┬───────┘                           │
       │                                   │ axios
       │ localStorage                      ▼
       ▼                          ┌──────────────────┐
   Browser storage                │ OpenWeatherMap   │
                                  │ /weather, /forecast,
                                  │ /geo/zip, /geo/reverse
                                  └──────────────────┘
```

### Why two state systems?

- **Redux Toolkit** holds the *user's curated list* — cities, primary selection, unit preference, geolocation consent. This is small, mutable, and needs to be persisted.
- **React Query** holds the *fetched weather payloads* — large, stale-able, and best managed by a cache with built-in deduplication, retry, and background refresh.

Mixing them would create a synchronization headache. Keeping them separate means each tool solves the problem it's good at.

---

## 2. Data Flow

### 2.1 Add-city flow

```
User submits ZIP
   ↓
SearchBar.onSubmit
   ↓
lookupZip(zip, country) ─→ OpenWeatherMap /geo/zip
   ↓
Resolved { name, lat, lon, country }
   ↓
dispatch(addCity({...}))
   ↓
Redux state updates (also writes to localStorage)
   ↓
Dashboard re-renders; new MiniCard mounts
   ↓
MiniCard's useCurrentWeather query fires
   ↓
React Query caches response; UI renders
```

### 2.2 Switch-primary flow

```
User clicks MiniCard
   ↓
dispatch(setPrimary(cityId))
   ↓
Dashboard's primaryCity memo recomputes
   ↓
HeroCard remounts with AnimatePresence crossfade
   ↓
HeroCard's useCurrentWeather query — likely already cached → instant render
   ↓
DynamicBackground picks up new theme
```

### 2.3 Unit-toggle flow

```
User clicks °C / °F
   ↓
dispatch(setUnit(newUnit))
   ↓
React Query keys (which include `unit`) change for all components
   ↓
New queries fire for cities × forecasts
   ↓
Previous unit's data stays in cache (gcTime: 30min) so toggling back is instant
```

---

## 3. Module Responsibilities

### 3.1 `src/api/client.ts`

Two Axios instances: `weatherClient` (data endpoints) and `geoClient` (geocoding). Both share:

- A request interceptor that injects `appid` from the env on every call.
- A response interceptor that normalizes errors into clean `Error` instances with human-readable messages. The UI surfaces these directly.

This is the *only* place the API key is read. Components never see it.

### 3.2 `src/api/weather.ts`

Pure functions per endpoint: `lookupZip`, `fetchCurrentWeather`, `fetchForecast`. No React, no state — easy to unit-test with `vi.mock('axios')`.

### 3.3 `src/store/citiesSlice.ts`

Single slice with reducers:

- `addCity` — guards against duplicates and the 5-city cap.
- `removeCity` — promotes the next city to primary if needed.
- `setPrimary` — no-ops if the id isn't in the list (defensive).
- `setUnit`, `setGeoConsent`, `reorderCities`.

Every reducer that mutates state calls `persist(state)` to write to `localStorage`. Persistence lives inside the slice rather than a separate middleware to keep the surface area small.

### 3.4 `src/hooks/useWeather.ts`

Thin wrappers over `useQuery`:

- Keys: `['current', cityId, unit]`, `['forecast', cityId, unit]`.
- `staleTime: 10min`, `gcTime: 30min`, `retry: 1`.
- `enabled` is gated on `city.lat && city.lon` so queries don't fire with undefined coordinates.

### 3.5 `src/hooks/useGeolocation.ts`

Wraps `navigator.geolocation.getCurrentPosition` in a Promise, then reverse-geocodes the result to a display name. Translates raw error codes (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`) into user-friendly strings.

### 3.6 `src/components/DynamicBackground.tsx` + `WeatherEffects.tsx`

`DynamicBackground` owns the gradient crossfade (via `AnimatePresence` keyed on theme). `WeatherEffects` is a `memo`-ized component that generates and renders the particle layer for the active theme. Particle arrays are generated once with `useMemo` so re-renders of the parent don't reseed.

### 3.7 `src/components/Dashboard.tsx`

Composition root. Reads Redux state, computes the active city + theme, conditionally renders the empty state or the populated grid. Also handles the *passive* geolocation attempt (only if permission is already granted) so returning users with no cities don't have to click again.

---

## 4. API Integration Strategy

### 4.1 Endpoints used

| Endpoint | Purpose | Cached |
| --- | --- | --- |
| `GET /geo/zip` | Resolve ZIP → coordinates | No (one-shot per add) |
| `GET /geo/reverse` | Resolve coordinates → name | No (one-shot per geolocate) |
| `GET /data/2.5/weather` | Current conditions for a city | 10 min stale, 30 min gc |
| `GET /data/2.5/forecast` | 5-day / 3-hour forecast for a city | 10 min stale, 30 min gc |

### 4.2 Auth

API key is read from `import.meta.env.VITE_WEATHER_API_KEY` and attached to every request by Axios interceptors. Never logged, never put in URL params manually by components.

### 4.3 Error normalization

Axios interceptors map status codes to messages:

| Status | Message |
| --- | --- |
| 401 | "Invalid API key. Check your `VITE_WEATHER_API_KEY`." |
| 404 | API's own `message` field, or "Location not found." |
| 429 | "Rate limit reached. Please slow down." |
| timeout | "Request timed out. Check your connection." |
| other | API message, or fallback to `error.message` |

React Query passes the thrown `Error` to the consuming component's `error` field; toasts display `error.message` directly.

### 4.4 Caching strategy

| Layer | Behavior |
| --- | --- |
| **React Query** | 10-min staleTime — no refetch on focus, no refetch on mount if fresh, automatic dedup |
| **HTTP cache** | We don't set any `Cache-Control` ourselves; OpenWeatherMap's defaults apply |
| **localStorage** | Only the *city list*, not weather payloads — payloads should refresh, the list is stable |

### 4.5 Rate-limit protection

- **Hard cap of 5 cities** means at most 10 queries (5 current + 5 forecast) per unit. On a unit toggle, that's up to 20 background refetches — well below OpenWeatherMap's free tier of 60/min.
- **Submit-on-Enter only** for the search bar, with a `busy` flag to disable double-submits. We don't query as the user types — adding a city is an explicit commitment, not a search-as-you-type interaction.
- **The `useDebouncedValue` hook is included** for future search-as-you-type features (e.g., a city autocomplete), but isn't wired into the current SearchBar by design.

---

## 5. Security Measures

### 5.1 Environment variables

- All secrets live in `.env`, gitignored.
- Only `VITE_`-prefixed variables are exposed to the client by Vite. We deliberately do not put anything else there.


### 5.2 XSS / injection

- React escapes everything by default.
- We never use `dangerouslySetInnerHTML`.
- API responses are typed; bad shape → React Query error path.

### 5.43PII

The only data leaving the browser is the user's coordinates (or ZIP), sent to OpenWeatherMap. Nothing else is transmitted anywhere. No analytics, no telemetry, no third-party scripts.

### 5.4 localStorage

We store: city display names, ZIPs, lat/lon, primary selection, unit, and a boolean geo consent flag. No tokens, no PII beyond approximate location. A user clearing site data fully resets the app.

---

## 6. Performance

### 6.1 Bundle

- Vite's tree-shaking + ESBuild minification.
- `lucide-react` is tree-shakable — only imported icons ship.
- Framer Motion's bundle is the heaviest single dependency (~50KB gzipped). It's worth it for the orchestrated animations; if size becomes critical, the same effects can be ported to CSS keyframes + `transform`.

### 6.2 Render

- `WeatherEffects` is `React.memo`'d and its particle arrays are `useMemo`'d. Theme changes regenerate the layer; nothing else does.
- The `DynamicBackground` is `fixed` and outside the main grid, so reflows in the dashboard don't repaint it.
- Mini cards use `motion.div` with `layout` so reordering animates automatically.

### 6.3 Network

- React Query dedupes concurrent requests for the same key.
- 10-minute staleTime means a returning user inside that window hits zero network requests.
- On unit toggle, queries fire in parallel; React Query manages concurrency.

---

## 7. Testing Strategy (recommended additions)

This codebase ships without tests in the interest of brevity, but the architecture is designed to be testable:

- **`api/weather.ts`**: pure functions — mock Axios and assert request shape + response handling.
- **`store/citiesSlice.ts`**: pure reducers — feed `(initialState, action)` and assert new state.
- **`utils/theme.ts`**: pure mapping — table-driven test.
- **Hooks**: use `@testing-library/react-hooks` or `renderHook`.
- **Components**: `@testing-library/react` + `msw` for API mocking. Test the Empty State, the 5-city cap toast, the unit toggle invalidating queries, etc.

Suggested deps to add: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `msw`, `@vitest/coverage-v8`.

---

