package com.runner.core.run.dto.response;

import com.runner.core.run.domain.RunRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RunRecordResponse {
    private Long runRecordId;
    private Long runnerId;
    private Long shoeId;
    private LocalDateTime runDatetime;
    private LocalDate runDate;
    private Integer durationSec;
    private BigDecimal distanceKm;
    private Integer avgPaceSec; // 계산된 페이스
    private String formattedPace; // 알기쉬운 페이스문자열
    private Integer avgHr;
    private Integer maxHr;
    private Integer conditionScore;
    private String painAreaCode;
    private Integer painLevel;
    private BigDecimal temperature;
    private Integer humidity;
    private String weatherCode;
    private String memo;
    private LocalDateTime createdAt;

    public static RunRecordResponse from(RunRecord record) {
        return RunRecordResponse.builder()
                .runRecordId(record.getRunRecordId())
                .runnerId(record.getRunnerId())
                .shoeId(record.getShoeId())
                .runDatetime(record.getRunDatetime())
                .runDate(record.getRunDate())
                .durationSec(record.getDurationSec())
                .distanceKm(record.getDistanceKm())
                .avgPaceSec(record.getAvgPaceSec())
                .formattedPace(formatPace(record.getAvgPaceSec()))
                .avgHr(record.getAvgHr())
                .maxHr(record.getMaxHr())
                .conditionScore(record.getConditionScore())
                .painAreaCode(record.getPainAreaCode())
                .painLevel(record.getPainLevel())
                .temperature(record.getTemperature())
                .humidity(record.getHumidity())
                .weatherCode(record.getWeatherCode())
                .memo(record.getMemo())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private static String formatPace(Integer avgPaceSec) {
        if(avgPaceSec == null || avgPaceSec <= 0) return null;
        int min = avgPaceSec / 60;
        int sec = avgPaceSec % 60;
        return String.format("%02d'%02d\"", min, sec);
    }

}
