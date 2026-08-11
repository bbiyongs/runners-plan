package com.runner.core.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WeatherLookupResponseDto {
    private Double temperature;
    private Integer humidity;
    private String weatherCode;
    private String locationName;
}
