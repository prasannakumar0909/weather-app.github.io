# Forecast Weather App — Functional Documentation

This document describes Forecast from the user's perspective: what the product does, how flows behave, and the explicit feature inventory.

---

## 1. Product Summary

Forecast is a personal weather dashboard. A user lands on a single page, optionally allows geolocation (or skips it), and curates a list of up to five cities they care about. One city is always "primary" and gets a full-bleed hero treatment with hourly + 5-day forecasts; the rest live in a compact rail and can be promoted to primary with one click.

The visual language adapts to the primary city's current conditions — sunny days fade to gold and orange, rainy ones to slate blue, stormy nights to deep indigo with crawling lightning. The point is to make the weather *feel*, not just inform.

---

## 2. Primary User Flows

### 2.1 First-time visit (no saved state)

1. App renders with a neutral gradient background.
2. The No State card appears: *"Welcome to Forecast"*, with a single CTA: **Use My Location**.
3. User clicks **Use My Location**.
   - Browser permission prompt appears.
   - On **allow**: the app calls `navigator.geolocation.getCurrentPosition`, reverse-geocodes via OpenWeatherMap, and adds the resulting city as the primary. Background gradient crossfades to the appropriate theme.
   - On **deny**: a toast appears explaining that they can add a city via ZIP code instead.
4. Alternatively, the user types a ZIP in the search bar and selects a country, then clicks **Add**. That city becomes primary.

### 2.2 Returning visit (state in localStorage)

1. App boots, reads cities + primary + unit + geo consent from `localStorage`.
2. React Query refetches data for every saved city (parallel) — data older than 10 minutes is considered stale and is refreshed automatically.
3. The user's last primary city is restored.
4. If the user had previously granted geolocation and there are no saved cities, the app silently locates them (no prompt, since permission is already granted).

### 2.3 Adding a city by ZIP

1. User focuses the SearchBar input.
2. User types a postal code; (defaults to US).
3. User clicks **Add** (or hits Enter).
4. App validates with OpenWeatherMap's `/geo/zip` endpoint.
   - On success: city is added to the Redux list and the input clears.
   - On failure (invalid zip, network error, API key issue): toast notification displays the normalized error message.
5. If 5 cities are already saved, an error toast explains the cap and asks the user to remove one first. The input remains populated so they can retry.

### 2.4 Switching the primary city

1. User clicks any Mini Card in the "My Cities" panel.
2. Redux `primaryId` is updated.
3. The Hero swaps to the new city with an `AnimatePresence` crossfade.
4. The background theme animates to match.
5. Hourly + 5-day forecasts re-render for the new city. If the data is already cached (recent visit), no network request is made.

### 2.5 Removing a city

1. User hovers a Mini Card; an **X** appears in the corner.
2. User clicks the X.
3. Card animates out (scale + fade).
4. Redux removes it. If it was the primary, the first remaining city becomes primary. If it was the last city, the No State returns.

### 2.6 Toggling units

1. User clicks **°C** or **°F** on the unit toggle.
2. Toggle thumb springs to the new position.
3. All cached queries are invalidated *implicitly* — the unit is part of every React Query key, so the new unit's queries fire and populate independently. The previous unit's data remains cached, so toggling back is instant.

---

## 3. Feature Inventory

### 3.1 Core

| Feature | Description |
| --- | --- |
| **Auto-locate** | One-tap geolocation that uses cached browser permissions when available |
| **Add by ZIP** | Up to 5 cities, 8 supported country codes |
| **Primary/secondary layout** | One hero card + grid of mini cards |
| **Promote-on-click** | Any mini card can become the primary |
| **Remove city** | Hover-revealed X on each mini card |
| **Persistence** | Cities, primary, unit, and geo consent stored in localStorage |
| **5-city cap** | Hard limit enforced in the Redux reducer (not just the UI) |
| **°C / °F toggle** | Affects all displayed temperatures and wind units |

### 3.2 Visual

| Feature | Description |
| --- | --- |
| **Dynamic gradients** | 9 distinct gradient themes mapped to weather + day/night |
| **Crossfade transition** | Background gradient fades smoothly when active city changes |
| **Particle effects** | Rain droplets, snowflakes, drifting clouds, twinkling stars, sun glow, lightning flashes, mist gradients |
| **Glassmorphism** | All cards use a custom `glass` / `glass-strong` utility with backdrop-filter blur + saturation |
| **Grain overlay** | SVG noise applied at 4% opacity for tactile feel |
| **Typography pairing** | Cormorant Garamond (display) + Outfit (body) + JetBrains Mono (forthcoming charts) |
| **Decorative oversized icon** | Large semi-transparent weather icon in the hero card corner |
| **Staggered entrance** | Cards and forecast items fade/slide in with sequenced delays |

### 3.3 Forecast

| Feature | Description |
| --- | --- |
| **Hero metrics** | Wind, humidity, pressure, visibility, sunrise, sunset |
| **Feels-like + min/max** | Beneath the main temperature |
| **Hourly strip** | Next 24 hours in 3-hour resolution (8 entries) with temp, icon, and precipitation % |
| **5-day outlook** | Per-day min/max bars with condition icon and precipitation % |
| **Local time display** | All times reflect the city's IANA offset, not the user's clock |

### 3.4 Feedback / Resilience

| Feature | Description |
| --- | --- |
| **Toast notifications** | Success and error feedback for all user actions |
| **Loading skeletons** | Pulsing placeholders for HeroCard, HourlyForecast, DailyForecast |
| **Error states** | Per-card error messages with retry guidance |
| **Reduced motion** | All animations disabled when `prefers-reduced-motion: reduce` is set |
| **Empty state** | Friendly onboarding card when no cities are saved |

---

## 4. UI States Reference

| Component | States |
| --- | --- |
| **Dashboard** | `empty`, `populated` |
| **HeroCard** | `loading`, `success`, `error` |
| **MiniCard** | `loading`, `success`, `error`; modifier: `active` / `inactive`; transient: `hover` (reveals remove) |
| **SearchBar** | `idle`, `busy`, `disabled` (when input empty) |
| **UnitToggle** | `C`, `F` |
| **HourlyForecast** | `loading`, `success`, `error` |
| **DailyForecast** | `loading`, `success`, `error` |

---

## 5. Accessibility Notes

- All interactive elements are real buttons or have explicit `role` + `tabIndex`.
- The unit toggle uses `aria-pressed`.
- The active mini card uses `aria-current="true"`.
- Color contrast was checked against AA at WCAG for all glass surfaces (white text on at least 40% black-equivalent base).
- Reduced motion is honored globally in `index.css`.
- Form inputs are labeled via `aria-label`.

