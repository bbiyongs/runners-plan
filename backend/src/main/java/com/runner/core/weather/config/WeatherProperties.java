package com.runner.core.weather.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix="weather-service")
public class WeatherProperties {
    private Api api =  new Api();
    private DefaultLocation defaultConfig = new DefaultLocation();
    private Fallback fallback = new Fallback();

    @Getter @Setter
    public static class Api {
        private String url = "https://api.open-meteo.com/v1/forecast";
        private String timezone = "Asia/Seoul";
    }

    @Getter @Setter
    public static class DefaultLocation {
        private String locationGroup = "RUNNING_LOCATION";
        private String locationName = "서울/수도권 북부";
        private Double lat = 37.5665;
        private Double lon = 126.9780;
        private Integer hour = 12;
    }

    @Getter @Setter
    public static class Fallback {
        private Double temperature = 22.5;
        private Integer humidity = 60;
        private String weatherCode = "SUNNY";
    }
}
