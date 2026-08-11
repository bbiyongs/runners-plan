package com.runner.core.runner.mapper;

import com.runner.core.runner.domain.Runner;
import com.runner.core.runner.domain.RunnerSocialAccount;
import com.runner.core.runner.domain.RunnerStatVo;
import com.runner.core.runner.dto.response.DashboardResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RunnerMapper {

    Optional<RunnerSocialAccount> findSocialAccount(@Param("provider") String provider, @Param("providerUserId") String providerUserId);

    void insertRunner(Runner runner);

    void insertSocialAccount(RunnerSocialAccount socialAccount);

    Optional<Runner> findRunnerById(@Param("runnerId") Long runnerId);

    void updateLastLoginAt(@Param("socialAccountId") Long socialAccountId);

    // 대시보드 누적 및 월간 통계 집계 조회
    RunnerStatVo getRunnerStat(@Param("runnerId")Long runnerId);

    // 대시보드 최근 러닝기록 조회
    List<DashboardResponse.RecentActivityDto> getRecentActivities(
        @Param("runnerId") Long runnerId,
        @Param("limit") int limit
    );

    // 최근 N 개월 월별 누적거리
    List<DashboardResponse.MonthlyTrendDto> getMonthlyTrends(
            @Param("runnerId") Long runnerId,
            @Param("months") int months
    );
}
