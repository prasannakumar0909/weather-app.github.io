package com.example.weather.service;

import java.net.URI;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class OpenWeatherService {

    private static final String GEO_API_BASE = "https://api.openweathermap.org/geo/1.0";
    private static final String WEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";

    private final String apiKey;
    private final RestTemplate restTemplate;

    public OpenWeatherService(@Value("${openweathermap.api.key:}") String apiKey) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Missing OpenWeatherMap API key. Set OPENWEATHERMAP_API_KEY before running the backend.");
        }
        this.apiKey = apiKey;
        this.restTemplate = new RestTemplate();
    }

    public String lookupZip(String zip, String country) {
        return proxyGet(GEO_API_BASE + "/zip", Map.of(
                "zip", zip + "," + country
        ));
    }

    public String fetchCurrentWeather(String lat, String lon, String units) {
        return proxyGet(WEATHER_API_BASE + "/weather", Map.of(
                "lat", lat,
                "lon", lon,
                "units", units
        ));
    }

    public String fetchForecast(String lat, String lon, String units) {
        return proxyGet(WEATHER_API_BASE + "/forecast", Map.of(
                "lat", lat,
                "lon", lon,
                "units", units
        ));
    }

    private String proxyGet(String url, Map<String, String> queryParams) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
                .queryParam("appid", apiKey);
        queryParams.forEach(builder::queryParam);

        URI targetUri = builder.build().toUri();
        return restTemplate.getForObject(targetUri, String.class);
    }
}
