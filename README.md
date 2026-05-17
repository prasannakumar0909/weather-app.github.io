# Forecast — Weather App

A high-performance, glassmorphic weather application built with React + Vite, TypeScript, Tailwind CSS, Redux Toolkit, React Query, and Framer Motion.

---

##  Features

- **Auto-locate on first load** via `navigator.geolocation` (only after the browser has already granted permission — no surprise prompts).
- **Add up to 5 cities** by ZIP / postal code.
- **Dynamic theming**: gradients and animated particle layers (rain, snow, lightning, stars, drifting clouds, sun glow, mist) crossfade as the active city's weather changes.
- **Glassmorphism UI** with custom typography and grain texture overlay.
- **Hero + Mini cards layout**: a primary city in focus, plus a tappable rail of secondary cities. Click any mini card to promote it.
- **Hourly strip (next 24h)** and **5-day outlook** with min/max bars and precipitation probability.
- **Celsius ⇄ Fahrenheit toggle** with spring-animated thumb.
- **Toast notifications** for all error and success paths.
- **Persistent state**: cities, primary, and unit choice survive reloads via `localStorage`.
- **Reduced-motion aware**: respects `prefers-reduced-motion`.

---

## 🚀 Quick Start

### 1. Install

```bash
npm install
```

### 2. Get an API key

Forecast uses OpenWeatherMap. Free tier is plenty.

1. Get your API key from the openweathermap

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_WEATHER_API_KEY=your_actual_key_here
```

> ⚠️ Never commit `.env`. It's in `.gitignore` by default.

### 4. Run

```bash
npm run dev
```

App will open at <http://localhost:5173>.

### 5. Build for production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├─ api/
│  ├─ client.ts          # Axios instances with interceptors (auth, errors)
│  └─ weather.ts         # Endpoint functions: lookupZip, fetchCurrentWeather, fetchForecast
├─ components/
│  ├─ Dashboard.tsx      # Top-level layout orchestration
│  ├─ DynamicBackground.tsx
│  ├─ WeatherEffects.tsx # Framer Motion particle systems
│  ├─ HeroCard.tsx       # Primary city display
│  ├─ MiniCard.tsx       # Secondary city tile
│  ├─ SearchBar.tsx      # Zip + country form
│  ├─ UnitToggle.tsx     # °C / °F switch
│  ├─ HourlyForecast.tsx # Next 24h horizontal scroll
│  ├─ DailyForecast.tsx  # 5-day summary
│  ├─ NoState.tsx     # First-run welcome
│  └─ WeatherIcon.tsx    # Lucide icon mapper
├─ hooks/
│  ├─ useWeather.ts      # React Query wrappers
│  ├─ useGeolocation.ts  # Browser geolocation + reverse-geocode
│  └─ useDebouncedValue.ts
├─ store/
│  ├─ index.ts           # Redux store + typed hooks
│  └─ citiesSlice.ts     # Cities, primary, unit, geo consent
├─ types/
│  └─ weather.ts         # Shared TS types
├─ utils/
│  ├─ format.ts          # Temperature, time, debounce helpers
│  └─ theme.ts           # Theme derivation + gradient/accent maps
├─ styles/
│  └─ index.css          # Tailwind + glass utilities
├─ App.tsx               # Providers (Redux, React Query, Toaster)
└─ main.tsx              # Entry
```

---

## 📖 Documentation

- [`docs/FUNCTIONAL.md`](docs/FUNCTIONAL.md) — User flows, feature inventory, UX states
- [`docs/TECHNICAL.md`](docs/TECHNICAL.md) — Architecture, API integration, security, performance

---

## 🧰 Stack Rationale

| Concern | Choice | Why |
| --- | --- | --- |
| Build tool | **Vite** | Sub-second HMR, native ESM, zero config |
| Language | **TypeScript** (strict) | Catch API shape drift at compile time |
| Styling | **Tailwind CSS** | Co-located styles, design tokens via theme |
| Server state | **React Query** | Cache, dedup, background refresh — perfect for read-heavy weather data |
| Client state | **Redux Toolkit** | A single source of truth for the *city list* (which is the only mutable client state worth managing globally) |
| Motion | **Framer Motion** | `AnimatePresence`, `layout`, declarative orchestration |
| HTTP | **Axios** | Interceptors give us one place to inject the API key and normalize errors |
| Icons | **lucide-react** | Tree-shakable, consistent stroke weights |
| Notifications | **react-hot-toast** | Tiny, themable, no provider boilerplate beyond `<Toaster />` |

---

## 🛡 Security Notes

1. **API keys** live in `.env` files, never committed. Vite exposes only `VITE_`-prefixed vars.
2. **Client-side keys** are still visible in the browser bundle — for production, proxy through a backend or use a domain-restricted key.
3. **Rate limiting**: the SearchBar form requires an explicit submit; the auto-detect path runs at most once per session. React Query's `staleTime` (10 min) prevents accidental refetch storms.
4. **No PII**: nothing is sent to any server other than OpenWeatherMap. Geolocation is used only to resolve coordinates client-side.
5. **localStorage scope**: persisted state contains only city display names and coordinates — nothing sensitive.

---

## 🔧 Development Tips

- React Query Devtools open via the floating icon (dev only).
- Redux state inspectable via the [Redux DevTools browser extension](https://github.com/reduxjs/redux-devtools).
- All animations honor `prefers-reduced-motion`.
- Tailwind's IntelliSense extension works out-of-the-box.

---
