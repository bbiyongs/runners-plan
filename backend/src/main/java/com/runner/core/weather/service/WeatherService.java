package com.runner.core.weather.service;

import com.runner.core.code.domain.CodeDetail;
import com.runner.core.code.mapper.CodeMapper;
import com.runner.core.weather.config.WeatherProperties;
import com.runner.core.weather.domain.WmoWeatherCode;
import com.runner.core.weather.dto.WeatherLookupResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {

    private final WeatherProperties weatherProps;
    private final CodeMapper codeMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> getActiveLocationList() {
        List<CodeDetail> details = codeMapper.findCodeDetailsByGroupCode(weatherProps.getDefaultConfig().getLocationGroup());
        return details.stream()
                .map(CodeDetail::getCodeName)
                .collect(Collectors.toList());
    }

    public WeatherLookupResponseDto getWeatherByLocationAndDateTime(String locationName, String dateStr, String timeStr) {
        List<CodeDetail> details = codeMapper.findCodeDetailsByGroupCode(weatherProps.getDefaultConfig().getLocationGroup());
        Double lat = weatherProps.getDefaultConfig().getLat();
        Double lon = weatherProps.getDefaultConfig().getLon();
        String targetName = (locationName != null && !locationName.isBlank()) ? locationName : weatherProps.getDefaultConfig().getLocationName();

        for (CodeDetail detail : details) {
            if (detail.getCodeName().equals(targetName) && detail.getDescription() != null) {
                String[] coords = detail.getDescription().split(",");
                if (coords.length == 2) {
                    try {
                        lat = Double.parseDouble(coords[0].trim());
                        lon = Double.parseDouble(coords[1].trim());
                    } catch (Exception ignored) {}
                }
                break;
            }
        }

        String targetDate = (dateStr != null && !dateStr.isBlank()) ? dateStr : LocalDate.now().toString();
        int targetHour = weatherProps.getDefaultConfig().getHour();
        if (timeStr != null && timeStr.contains(":")) {
            try {
                targetHour = Integer.parseInt(timeStr.split(":")[0].trim());
            } catch (Exception ignored) {}
        }

        try {
            String url = weatherProps.getApi().getUrl() +
                    "?latitude={lat}&longitude={lon}&start_date={date}&end_date={date}&hourly=temperature_2m,relative_humidity_2m,weather_code&timezone={tz}";

            Map<String, Object> params = new HashMap<>();
            params.put("lat", lat);
            params.put("lon", lon);
            params.put("date", targetDate);
            params.put("tz", weatherProps.getApi().getTimezone());

            Map<String, Object> response = restTemplate.getForObject(url, Map.class, params);
            return parseOpenMeteoResponse(response, targetHour, targetName);

        } catch (Exception e) {
            log.error("Open-Meteo 날씨 API 호출 예외 (Fallback 적용): {}", e.getMessage());
            return WeatherLookupResponseDto.builder()
                    .temperature(weatherProps.getFallback().getTemperature())
                    .humidity(weatherProps.getFallback().getHumidity())
                    .weatherCode(weatherProps.getFallback().getWeatherCode())
                    .locationName(targetName)
                    .build();
        }
    }

    private WeatherLookupResponseDto parseOpenMeteoResponse(Map<String, Object> body, int targetHour, String locationName) {
        if (body == null || !body.containsKey("hourly")) {
            return WeatherLookupResponseDto.builder()
                    .temperature(weatherProps.getFallback().getTemperature())
                    .humidity(weatherProps.getFallback().getHumidity())
                    .weatherCode(weatherProps.getFallback().getWeatherCode())
                    .locationName(locationName)
                    .build();
        }

        Map<String, Object> hourly = (Map<String, Object>) body.get("hourly");
        List<Double> temps = (List<Double>) hourly.get("temperature_2m");
        List<Integer> hums = (List<Integer>) hourly.get("relative_humidity_2m");
        List<Integer> weatherCodes = (List<Integer>) hourly.get("weather_code");

        int index = Math.min(Math.max(targetHour, 0), 23);

        Double temp = (temps != null && temps.size() > index) ? temps.get(index) : weatherProps.getFallback().getTemperature();
        Integer humidity = (hums != null && hums.size() > index) ? hums.get(index) : weatherProps.getFallback().getHumidity();
        Integer wCode = (weatherCodes != null && weatherCodes.size() > index) ? weatherCodes.get(index) : 0;

        String mappedWeatherCode = WmoWeatherCode.toServiceWeatherCode(wCode);

        return WeatherLookupResponseDto.builder()
                .temperature(Math.round(temp * 10.0) / 10.0)
                .humidity(humidity)
                .weatherCode(mappedWeatherCode)
                .locationName(locationName)
                .build();
    }
}
