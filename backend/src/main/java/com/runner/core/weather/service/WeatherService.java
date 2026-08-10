package com.runner.core.weather.service;

import com.runner.core.code.domain.CodeDetail;
import com.runner.core.code.mapper.CodeMapper;
import com.runner.core.weather.config.WeatherProperties;
import com.runner.core.weather.domain.RunningLocation;
import com.runner.core.weather.dto.WeatherLookupResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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

    // DB 에서 등록된 지역 목록 반환 (frontend)
    public List<String> getActiveLocationList() {
        List<CodeDetail> details = codeMapper.findCodeDetailsByGroupCode(weatherProps.getDefaultConfig().getLocationGroup());
        return details.stream()
                .map(CodeDetail::getCodeName)
                .collect(Collectors.toList());
    }

    // DB 에서 선택한 지역 좌표 읽어와 날씨 API 호출
    public WeatherLookupResponseDto getWeatherByLocationAndDateTime(String locationName, String dateStr, String timeStr){

        //  db에서 선택한 지역 좌표 찾기
        List<CodeDetail> details = codeMapper.findCodeDetailsByGroupCode(weatherProps.getDefaultConfig().getLocationGroup());

        Double lat = weatherProps.getDefaultConfig().getLat();
        Double lon = weatherProps.getDefaultConfig().getLon();
        String targetName = (locationName != null && locationName.isBlank())? locationName : weatherProps.getDefaultConfig().getLocationName();

        for(CodeDetail detail : details){
            if(detail.getCodeName().equals(targetName) && detail.getDescription() != null) {
                String[] coords = detail.getDescription().split(",");
                if(coords.length == 2){
                    try{
                        lat = Double.parseDouble(coords[0].trim());
                        lon = Double.parseDouble(coords[1].trim());
                    } catch (Exception ignored){}
                }
                break;
            }
        }

        // 날짜 시간 시점 타임스탬프 계산
        long timestamp = System.currentTimeMillis() / 1000;
        if(dateStr != null && timeStr != null){
            try{
                String dateTimeStr = dateStr + " " + timeStr;
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                LocalDateTime localDateTime = LocalDateTime.parse(dateTimeStr, formatter);
                timestamp = localDateTime.atZone(ZoneId.systemDefault()).toEpochSecond();
            } catch (Exception e) {
                log.warn("날짜 파싱 오류 , 현재시간 적용 {}",e.getMessage());
            }
        }

        // openweather api 호출
        try {
            String url = weatherProps.getApi().getUrl() + "?lat={lat}&lon={lon}&dt={dt}&appid={appid}&units=metric&lang=kr";

            Map<String, Object> params = new HashMap<>();
            params.put("lat", lat);
            params.put("lon", lon);
            params.put("dt", timestamp);
            params.put("appid", weatherProps.getApi().getKey());

            Map<String, Object> response = restTemplate.getForObject(url, Map.class, params);
            WeatherLookupResponseDto result = parseOpenWeatherResponse(response);

            return WeatherLookupResponseDto.builder()
                    .temperature(result.getTemperature())
                    .humidity(result.getHumidity())
                    .weatherCode(result.getWeatherCode())
                    .locationName(targetName)
                    .build();

        } catch (Exception e) {
            log.error("날씨 API 호출 예외 {}", e.getMessage());
            return WeatherLookupResponseDto.builder()
                    .temperature(weatherProps.getFallback().getTemperature())
                    .humidity(weatherProps.getFallback().getHumidity())
                    .weatherCode(weatherProps.getFallback().getWeatherCode())
                    .locationName(targetName)
                    .build();
        }
    }

    public WeatherLookupResponseDto getWeatherByCoords(String locationLabel, String dateStr, String timeStr) {
        // 선택한 지역 위경도 찾기
        RunningLocation location = RunningLocation.findByLabel(locationLabel);

        // 날짜 / 시간 단위 변환
        long timeStamp = System.currentTimeMillis() / 1000;
        if(dateStr != null && timeStr != null) {
            try {
                String dateTimeStr = dateStr + " " + timeStr;
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                LocalDateTime localDateTime = LocalDateTime.parse(dateTimeStr, formatter);
                timeStamp = localDateTime.atZone(ZoneId.systemDefault()).toEpochSecond();
            } catch (Exception e) {
                log.warn("날짜 파싱 실패 , 현재 시간 적용 {}", e.getMessage());
            }
        }

        try {
            String url = weatherProps.getApi().getUrl() + "?lat={lat}&lon={lon}&appid={appid}&units=metric&lang=kr";

            Map<String, Object> params = new HashMap<>();
            params.put("lat", location.getLat());
            params.put("lon", location.getLon());
            params.put("dt", timeStamp);
            params.put("appid", weatherProps.getApi().getKey());

            Map<String, Object> response = restTemplate.getForObject(url, Map.class, params);
            WeatherLookupResponseDto result = parseOpenWeatherResponse(response);

            return WeatherLookupResponseDto.builder()
                    .temperature(result.getTemperature())
                    .humidity(result.getHumidity())
                    .weatherCode(result.getWeatherCode())
                    .locationName(location.getLabel())
                    .build();

        } catch (Exception e) {
            log.error("Openweather api 예외 발생 {} ",e.getMessage());
            return WeatherLookupResponseDto.builder()
                    .temperature(weatherProps.getFallback().getTemperature())
                    .humidity(weatherProps.getFallback().getHumidity())
                    .weatherCode(weatherProps.getFallback().getWeatherCode())
                    .locationName(location.getLabel())
                    .build();
        }
    }

    private WeatherLookupResponseDto parseOpenWeatherResponse(Map<String, Object> body) {
        if(body == null) return null;

        Map<String, Object> main = (Map<String, Object>) body.get("main");
        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) body.get("weather");

        Double temp = main != null ? Double.parseDouble(main.get("temp").toString()) : 0.0;
        Integer humidity = main != null ? Integer.parseInt(main.get("humidity").toString()) : 0;

        String weatherMain = "";
        if(weatherList != null && !weatherList.isEmpty()){
            weatherMain = weatherList.get(0).get("main").toString().toUpperCase();
        }

        // 서비스 공통 날씨 코드 매핑 (SUNNY, CLOUDY, RAIN, SNOW)
        String weatherCode = "SUNNY";
        if (weatherMain.contains("RAIN") || weatherMain.contains("DRIZZLE") || weatherMain.contains("THUNDER")) {
            weatherCode = "RAIN";
        } else if (weatherMain.contains("SNOW") || weatherMain.contains("ICE")) {
            weatherCode = "SNOW";
        } else if (weatherMain.contains("CLOUD") || weatherMain.contains("MIST") || weatherMain.contains("FOG")) {
            weatherCode = "CLOUDY";
        }

        return WeatherLookupResponseDto.builder()
                .temperature(Math.round(temp * 10.0) / 10.0)
                .humidity(humidity)
                .weatherCode(weatherCode)
                .locationName(body.getOrDefault("name", "").toString())
                .build();
    }
}
