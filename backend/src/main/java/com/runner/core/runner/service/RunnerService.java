package com.runner.core.runner.service;

import com.runner.core.runner.domain.Runner;
import com.runner.core.runner.domain.RunnerStatVo;
import com.runner.core.runner.dto.response.DashboardResponse;
import com.runner.core.runner.mapper.RunnerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RunnerService {
    private  final RunnerMapper runnerMapper;

    // 대시보드 요약 정보 조회
    @Transactional(readOnly = true)
    public DashboardResponse getRunnerDashboard(Long runnerId) {
        // 기본정보 조회
        Runner runner = runnerMapper.findRunnerById(runnerId)
                .orElseThrow(()-> new IllegalArgumentException("러너 정보가 없습니다. ID :" + runnerId));
        // 데이터 조회
        RunnerStatVo stat = runnerMapper.getRunnerStat(runnerId);
        if(stat == null) {
            stat = new RunnerStatVo(); // 없을 경우 기본값
        }

        // 최근 활동 및 6개월 추이 조회
        List<DashboardResponse.RecentActivityDto> recentActivities = runnerMapper.getRecentActivities(runnerId, 3);
        List<DashboardResponse.MonthlyTrendDto> monthlyTrends = runnerMapper.getMonthlyTrends(runnerId, 6);

        List<DashboardResponse.RecentActivityDto> formattedRecent = recentActivities.stream()
                .map(act -> DashboardResponse.RecentActivityDto.builder()
                    .runRecordId(act.getRunRecordId())
                    .runDate(act.getRunDate())
                    .distanceKm(act.getDistanceKm())
                    .durationSec(act.getDurationSec())
                    .avgPaceSec(act.getAvgPaceSec())
                    .formattedAvgPace(DashboardResponse.formatPace(act.getAvgPaceSec()))
                    .conditionScore(act.getConditionScore())
                    .painAreaCode(act.getPainAreaCode())
                    .painLevel(act.getPainLevel())
                    .memo(act.getMemo())
                    .build()).collect(Collectors.toList());

        // 누적거리에 따른 러너 케릭터 레벨 계산
        BigDecimal totalDistance = stat.getTotalDistanceKm() != null ? stat.getTotalDistanceKm(): BigDecimal.ZERO;
        String[] levelInfo = calculateRunnerLevel(totalDistance);
        String levelCode = levelInfo[0];
        String levelName = levelInfo[1];

        log.info("대시보드 조회 : runnerID {}  누적거리 {}km  레벨 {}" , runnerId, totalDistance, levelName);

        // DTO 구성 변환
        return DashboardResponse.builder()
                .runnerId(runner.getRunnerId())
                .nickname(runner.getNickname())
                .profileImageUrl(runner.getProfileImageUrl())
                .levelCode(levelCode)
                .levelName(levelName)
                .totalDistanceKm(totalDistance)
                .totalRunCount(stat.getTotalRunCount() != null? stat.getTotalRunCount() : 0)
                .totalDurationSec(stat.getTotalDurationSec() != null? stat.getTotalDurationSec() : 0)
                .avgPaceSec(stat.getAvgPaceSec() != null? stat.getAvgPaceSec() : 0)
                .formattedAvgPace(DashboardResponse.formatPace(stat.getAvgPaceSec()))
                .monthlyDistanceKm(stat.getMonthlyDistanceKm()!=null?stat.getMonthlyDistanceKm():BigDecimal.ZERO)
                .monthlyRunCount(stat.getMonthlyRunCount()!=null?stat.getMonthlyRunCount():0)
                .monthlyDurationSec(stat.getMonthlyDurationSec()!=null?stat.getMonthlyDurationSec():0)
                .recentActivities(formattedRecent)
                .monthlyTrends(monthlyTrends)
                .build();
    }

    // 누적 거리에 따른 레벨 코드
    private String[] calculateRunnerLevel(BigDecimal totalDistanceKm) {
        double distance = totalDistanceKm.doubleValue();

        if(distance >= 600.0) {
            return new String[]{"LV_CHEETAH", "치타러너"};
        } else if(distance >= 300.0) {
            return new String[]{"LV_WOLF", "늑대러너"};
        } else if(distance >= 100.0) {
            return new String[]{"LV_DEER", "사슴러너"};
        } else {
            return new String[]{"LV_CAT", "고양이러너"};
        }
    }
}
