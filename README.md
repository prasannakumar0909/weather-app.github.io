# Forecast — Weather App

A polished weather dashboard built with React + Vite, TypeScript, Tailwind CSS, Redux Toolkit, React Query, and Framer Motion.

---

## Features

- **Auto-locate by browser permission** via `navigator.geolocation`.
- **Add up to 5 cities** by ZIP/postal code.
- **Bulk ZIP entry**: enter multiple ZIPs separated by commas, spaces, or semicolons.
- **Dynamic theming**: gradients and animated weather effects adapt to the primary city's conditions.
- **Primary + mini city layout**: one main city with supporting city cards.
- **Hourly strip** and **5-day outlook** with precipitation probability.
- **Celsius ⇄ Fahrenheit** toggle.
- **Toast notifications** for success, duplicate entries, and errors.
- **Persistent state**: saved cities, primary selection, unit preference, and geo consent survive reloads via `localStorage`.
- **Backend proxy**: all weather requests are routed through the Spring Boot backend to protect the API key.
- **Reduced-motion aware**: respects `prefers-reduced-motion`.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your OpenWeatherMap key:

```env
VITE_API_BASE_URL=/api
VITE_BASE_URL=/
OPENWEATHERMAP_API_KEY=your_actual_key_here
```

> ⚠️ Do not commit `.env`. It is excluded from version control.

### 3. Run the backend

```bash
cd backend
mvn spring-boot:run
```

### 4. Run the frontend

From the repository root:

```bash
npm run dev
```

Open the app at <http://localhost:5173>.

---

## Deployment

The repository includes a root `Dockerfile` that builds the frontend and packages it into the Spring Boot backend.

1. Build the Docker image:

```bash
docker build -t forecast-weather .
```

2. Run the container:

```bash
docker run -p 8080:8080 --env OPENWEATHERMAP_API_KEY=your_actual_key_here forecast-weather
```

3. Visit <http://localhost:8080>.

---

## Project Structure

```
src/
├─ api/
│  ├─ client.ts          # Axios client with backend base URL and error normalization
│  └─ weather.ts         # Local endpoint wrappers: geo/zip, weather, forecast
├─ components/
│  ├─ Dashboard.tsx      # Layout and feature orchestration
│  ├─ DynamicBackground.tsx
│  ├─ WeatherEffects.tsx # Animated particle/weather visuals
│  ├─ HeroCard.tsx       # Primary city display
│  ├─ MiniCard.tsx       # Secondary city cards
│  ├─ SearchBar.tsx      # ZIP entry and bulk add UI
│  ├─ UnitToggle.tsx     # °C / °F switch
│  ├─ HourlyForecast.tsx # 24-hour forecast strip
│  ├─ DailyForecast.tsx  # 5-day forecast summary
│  ├─ NoState.tsx        # Welcome / geolocation prompt
│  └─ WeatherIcon.tsx    # Icon mapping
├─ hooks/
│  ├─ useWeather.ts      # React Query wrappers for current + forecast data
│  ├─ useGeolocation.ts  # Browser geolocation and reverse geocode helper
│  └─ useDebouncedValue.ts
├─ store/
│  ├─ index.ts           # Redux store configuration
│  └─ citiesSlice.ts     # Saved cities, primary city, units, geo consent
├─ types/
│  └─ weather.ts         # Shared weather and city types
├─ utils/
│  ├─ format.ts          # Formatting helpers for time, temperature, units
│  └─ theme.ts           # Weather theme mapping and gradients
├─ styles/
│  └─ index.css          # Tailwind and global styles
├─ App.tsx               # Providers and app shell
└─ main.tsx              # React entrypoint
```

---

## Documentation

- [`docs/FUNCTIONAL.md`](docs/FUNCTIONAL.md) — user flows, features, and UX states
- [`docs/TECHNICAL.md`](docs/TECHNICAL.md) — architecture, API details, and performance considerations

---

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build | Vite | fast HMR and modern build pipeline |
| Language | TypeScript | type-safe API and UI code |
| Styling | Tailwind CSS | utility-driven styling and responsive layout |
| Server state | React Query | caching, retry, stale-time, and deduping |
| Client state | Redux Toolkit | persisted user city list and preferences |
| Motion | Framer Motion | declarative transitions and layout animation |
| HTTP | Axios | error normalization and interceptors |
| Notifications | react-hot-toast | lightweight toast UX |

---

## Notes

- The backend proxies all OpenWeatherMap calls, so the public frontend never stores the raw API key.
- The frontend persists user state in `localStorage`, while weather payloads are cached in React Query.
- The app supports multiple ZIPs in one submission and enforces a hard limit of 5 saved cities.

---
