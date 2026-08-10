package com.runner.core.weather.controller;

import com.runner.core.weather.domain.RunningLocation;
import com.runner.core.weather.dto.WeatherLookupResponseDto;
import com.runner.core.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/locations")
    public ResponseEntity<List<String>> getLocationList() {
        // db 에서 등록된 지역 반환
        return ResponseEntity.ok(weatherService.getActiveLocationList());
    }

    @GetMapping("/lookup")
    public ResponseEntity<WeatherLookupResponseDto> lookupWeather(
            @RequestParam(value="location", required = false)String location,
            @RequestParam(value="date", required = false) String date,
            @RequestParam(value="time", required = false) String time
    ) {

        WeatherLookupResponseDto result = weatherService.getWeatherByLocationAndDateTime(location, date, time);
        return ResponseEntity.ok(result);
    }
/*
    @GetMapping("/locations")
    public ResponseEntity<List<String>> getLocations() {

        List<String> locations = Arrays.stream(RunningLocation.values())
                .map(RunningLocation::getLabel)
                .collect(Collectors.toList());

        return ResponseEntity.ok(locations);
    }
 */
}
