package com.runner.core.run.service;

import com.runner.core.run.domain.RunRecord;
import com.runner.core.run.dto.request.RunRecordCreateRequest;
import com.runner.core.run.dto.response.RunRecordResponse;
import com.runner.core.run.mapper.RunRecordMapper;
import com.runner.core.shoe.service.RunningShoesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RunRecordService {
    private final RunRecordMapper runRecordMapper;

    private final RunningShoesService shoesService;

    // 신규 러닝기록 등록
    @Transactional
    public RunRecordResponse createRunRecord(Long runnerId, RunRecordCreateRequest request) {
        Integer avgPaceSec = calculateAvgPaceSec(request.getDurationSec(), request.getDistanceKm());

        RunRecord record = RunRecord.builder()
                .runnerId(runnerId)
                .shoeId(request.getShoeId())
                .runDatetime(request.getRunDatetime())
                .runDate(request.getRunDatetime().toLocalDate())
                .durationSec(request.getDurationSec())
                .distanceKm(request.getDistanceKm())
                .avgPaceSec(avgPaceSec)
                .avgHr(request.getAvgHr())
                .maxHr(request.getMaxHr())
                .conditionScore(request.getConditionScore() != null ? request.getConditionScore() : 2)
                .painAreaCode(request.getPainAreaCode() != null ? request.getPainAreaCode() : "NONE")
                .painLevel(request.getPainLevel() != null ? request.getPainLevel() : 0)
                .temperature(request.getTemperature())
                .humidity(request.getHumidity())
                .weatherCode(request.getWeatherCode())
                .memo(request.getMemo())
                .build();

        runRecordMapper.insertRunRecord(record);
        log.info("러닝 기록 등록 완료 : runRecordId {} , runnerId {}", record.getRunRecordId(), runnerId);

        // 러닝화 누적 거리 가산 (+)
        if (request.getShoeId() != null) {
            shoesService.updateShoeDistance(request.getShoeId(), request.getDistanceKm());
        }

        return RunRecordResponse.from(record);
    }

    // 러닝 기록 목록 조회
    @Transactional(readOnly = true)
    public List<RunRecordResponse> getMyRunRecords(Long runnerId, LocalDate startDate, LocalDate endDate) {
        List<RunRecord> records = runRecordMapper.findByRunnerId(runnerId, startDate, endDate);

        return records.stream().map(RunRecordResponse::from)
                .collect(Collectors.toList());
    }

    // 기록 단건 상세조회
    @Transactional(readOnly = true)
    public RunRecordResponse getRuuRecordDetail(Long runnerId, Long runRecordId) {
        RunRecord record = runRecordMapper.findByIdAndRunnerId(runRecordId, runnerId)
                .orElseThrow(()-> new IllegalArgumentException("해당 러닝기록을 찾을수 없습니다. ID:" + runRecordId));

        return RunRecordResponse.from(record);
    }

    //러닝 기록 수정
    @Transactional
    public RunRecordResponse updateRunRecord(Long runnerId, Long runRecordId, RunRecordCreateRequest request) {
        RunRecord existingRecord = runRecordMapper.findByIdAndRunnerId(runRecordId, runnerId)
                .orElseThrow(()->new IllegalArgumentException("수정할 러닝 기록을 찾을 수 없습니다."));

        Integer avgPaceSec = calculateAvgPaceSec(request.getDurationSec(), request.getDistanceKm());

        existingRecord.setRunDatetime(request.getRunDatetime());
        existingRecord.setRunDate(request.getRunDatetime().toLocalDate());
        existingRecord.setDurationSec(request.getDurationSec());
        existingRecord.setDistanceKm(request.getDistanceKm());
        existingRecord.setAvgPaceSec(avgPaceSec);
        existingRecord.setAvgHr(request.getAvgHr());
        existingRecord.setMaxHr(request.getMaxHr());
        existingRecord.setConditionScore(request.getConditionScore());
        existingRecord.setPainAreaCode(request.getPainAreaCode());
        existingRecord.setPainLevel(request.getPainLevel());
        existingRecord.setTemperature(request.getTemperature());
        existingRecord.setHumidity(request.getHumidity());
        existingRecord.setWeatherCode(request.getWeatherCode());
        existingRecord.setMemo(request.getMemo());

        // 기존 신발 및 기존 거리 보관
        Long oldShoeId = existingRecord.getShoeId();
        BigDecimal oldDistance = existingRecord.getDistanceKm();

        existingRecord.setShoeId(request.getShoeId());

        runRecordMapper.updateRunRecord(existingRecord);
        log.info("러닝 기록 수정 : runRecordId {}  runnerId", runRecordId, runnerId);

        // 신발 누적거리 차감(-) 및 재가산(+) 동기화
        if (oldShoeId != null) {
            shoesService.updateShoeDistance(oldShoeId, oldDistance.negate()); // 이전 거리 차감
        }
        if (request.getShoeId() != null) {
            shoesService.updateShoeDistance(request.getShoeId(), request.getDistanceKm()); // 새 거리 가산
        }

        return RunRecordResponse.from(existingRecord);

    }

    @Transactional
    public void deleteRunRecord(Long runnerId, Long runRecordId) {
        RunRecord record = runRecordMapper.findByIdAndRunnerId(runRecordId, runnerId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 러닝 기록이 없습니다. ID: " + runRecordId));
        int deleteRows = runRecordMapper.deleteByIdAndRunnerId(runRecordId, runnerId);
        if (deleteRows == 0) {
            throw new IllegalArgumentException("삭제할 러닝 기록이 없습니다. ID: " + runRecordId);
        }
        // 삭제된 기록에 러닝화가 연결되어 있었다면 해당 거리만큼 차감(-)
        if (record.getShoeId() != null && record.getDistanceKm() != null) {
            shoesService.updateShoeDistance(record.getShoeId(), record.getDistanceKm().negate());
        }

        log.info("러닝 기록 삭제 완료 : recordId {}  runnerId {}", runRecordId, runnerId);
    }

    // 평균 페이스 계산 총시간 / 거리의 십진수
    private Integer calculateAvgPaceSec (Integer durationSec, BigDecimal distanceKm) {
        if(durationSec == null || distanceKm == null || distanceKm.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        return BigDecimal.valueOf(durationSec).divide(distanceKm, 0, RoundingMode.HALF_UP).intValue();
    }
}
