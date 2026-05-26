package com.example.weather.controller;

import com.example.weather.service.OpenWeatherService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private final OpenWeatherService openWeatherService;

    public WeatherController(OpenWeatherService openWeatherService) {
        this.openWeatherService = openWeatherService;
    }

    @GetMapping(value = "/geo/zip", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> lookupZip(
            @RequestParam String zip,
            @RequestParam(defaultValue = "US") String country
    ) {
        try {
            return ResponseEntity.ok(openWeatherService.lookupZip(zip, country));
        } catch (RestClientResponseException ex) {
            return ResponseEntity.status(ex.getRawStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ex.getResponseBodyAsString());
        }
    }

    @GetMapping(value = "/weather", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> currentWeather(
            @RequestParam String lat,
            @RequestParam String lon,
            @RequestParam String units
    ) {
        try {
            return ResponseEntity.ok(openWeatherService.fetchCurrentWeather(lat, lon, units));
        } catch (RestClientResponseException ex) {
            return ResponseEntity.status(ex.getRawStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ex.getResponseBodyAsString());
        }
    }

    @GetMapping(value = "/forecast", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> forecast(
            @RequestParam String lat,
            @RequestParam String lon,
            @RequestParam String units
    ) {
        try {
            return ResponseEntity.ok(openWeatherService.fetchForecast(lat, lon, units));
        } catch (RestClientResponseException ex) {
            return ResponseEntity.status(ex.getRawStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ex.getResponseBodyAsString());
        }
    }
}
