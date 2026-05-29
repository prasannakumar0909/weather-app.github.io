# Forecast Weather App — Functional Documentation

This document describes Forecast from the user's perspective: product behavior, supported flows, and the current feature set.

---

## 1. Product Summary

Forecast is a weather dashboard that lets users save up to five cities and inspect weather details for one primary city plus multiple secondary cities.

- The primary city appears in a large hero view with current conditions and forecasts.
- Secondary cities appear as mini cards and can be promoted to primary with one click.
- The UI adapts to weather conditions through animated gradients and particle effects.
- User preferences and saved cities are persisted locally.

---

## 2. Primary User Flows

### 2.1 First-time visit

1. The app loads with an empty dashboard.
2. The welcome card appears with a **Use My Location** button.
3. User clicks **Use My Location**.
   - Browser geolocation is requested.
   - If granted, the app reverse-geocodes coordinates through the backend and saves the resulting city.
   - The saved city becomes primary and the theme updates.
4. If geolocation is denied or unavailable, the user can add one or more cities by ZIP/postal code.

### 2.2 Returning visit

1. Saved cities, primary selection, unit preference, and geo consent are restored from `localStorage`.
2. React Query refreshes weather data as needed.
3. The last primary city is restored.
4. If no cities are saved but geolocation permission is already granted, the app silently locates the user once.

### 2.3 Adding cities by ZIP

1. User enters one or more ZIP/postal codes in the SearchBar.
2. The app supports comma-, space-, or semicolon-separated input.
3. User submits the form.
4. Valid zip codes are resolved by the backend proxy and added to the dashboard.
5. Duplicate entries and failures are reported with toasts.
6. The dashboard enforces a hard cap of five cities.

### 2.4 Promoting a city

1. User clicks a MiniCard.
2. `primaryId` updates in Redux.
3. The primary hero view switches to the selected city.
4. The weather theme transitions to the new city's conditions.

### 2.5 Removing a city

1. User hovers a MiniCard.
2. A remove control appears.
3. User removes the city.
4. If the removed city was primary, the next available city becomes primary.
5. If the last city is removed, the empty state returns.

### 2.6 Changing units

1. User toggles between **°C** and **°F**.
2. The preference is persisted in Redux and `localStorage`.
3. Weather queries update using the selected unit.
4. Previously cached data remains available for faster toggling.

---

## 3. Feature Inventory

| Feature | Description |
| --- | --- |
| **Geolocation onboarding** | Add the current location with one click |
| **Bulk ZIP entry** | Enter multiple ZIPs at once |
| **5-city limit** | Save up to five cities simultaneously |
| **Primary city focus** | One large hero city plus a mini card rail |
| **City promotion** | Tap any mini card to make it primary |
| **Local persistence** | Saved cities and preferences survive reloads |
| **Backend proxy** | OpenWeatherMap requests are routed through Spring Boot |
| **Unit toggle** | Convert between metric and imperial units |

### 3.1 Visual Behavior

| Feature | Description |
| --- | --- |
| **Adaptive gradients** | Weather-aware background themes |
| **Animated effects** | Rain, snow, lightning, stars, and haze visuals |
| **Glassmorphism** | Frosted glass panels and translucent cards |
| **Responsive layout** | Mobile-first hero and cards layout |
| **Accessible typography** | Strong hierarchy and legible text styling |

### 3.2 Forecast Capabilities

| Feature | Description |
| --- | --- |
| **Current conditions** | Temp, feels-like, humidity, wind, pressure, visibility |
| **Hourly forecast** | Next 24 hours in 3-hour increments |
| **5-day outlook** | Multi-day summary with min/max and precipitation |
| **Local time handling** | Times reflect the city's timezone |

### 3.3 Feedback and resilience

| Feature | Description |
| --- | --- |
| **Toast feedback** | Success, duplicate, and error messages |
| **Loading UI** | Spinners and skeleton elements during fetches |
| **Duplicate guard** | Prevents adding the same city twice |
| **Hard cap enforcement** | Redux prevents more than five cities |
| **Reduced motion** | Respects system motion preferences |

---

## 4. UI States

| Component | States |
| --- | --- |
| Dashboard | `empty`, `loaded` |
| SearchBar | `idle`, `busy`, `disabled` |
| HeroCard | `loading`, `loaded`, `error` |
| MiniCard | `active`, `inactive`, `removed` |
| UnitToggle | `metric`, `imperial` |
| NoState | `idle`, `locating`, `error` |

---

## 5. Accessibility Notes

- Form inputs have `aria-label` attributes.
- Buttons are keyboard-accessible.
- Reduced motion is applied when users prefer it.
- The app avoids `dangerouslySetInnerHTML` and uses semantic markup.
- Visual contrast is designed for readability on glass surfaces.

