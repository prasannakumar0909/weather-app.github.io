# Weather Backend

This backend proxies OpenWeatherMap requests so the frontend never calls the third-party API directly.

## Run locally

1. Start the backend directly with the built-in API key:

```bash
cd backend
mvn spring-boot:run
```

2. (Optional) Override the key with your own environment variable:

```bash
export OPENWEATHERMAP_API_KEY=your_actual_key_here
mvn spring-boot:run
```

The service listens on `http://localhost:8080` and exposes:

- `GET /api/geo/zip?zip={zip}&country={country}`
- `GET /api/weather?lat={lat}&lon={lon}&units={units}`
- `GET /api/forecast?lat={lat}&lon={lon}&units={units}`
