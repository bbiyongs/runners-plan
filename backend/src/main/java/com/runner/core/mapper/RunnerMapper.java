package com.runner.core.mapper;

import com.runner.core.domain.Runner;
import com.runner.core.domain.RunnerSocialAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface RunnerMapper {
    // 1. 소셜 제공자(GOOGLE/NAVER)와 사용자 고유 ID로 연동 계정 조회
    Optional<RunnerSocialAccount> findSocialAccount(
            @Param("provider") String provider,
            @Param("providerUserId") String providerUserId
    );
    // 2. 신규 러너 기본 정보 등록 (생성된 runner_id 반환)
    int insertRunner(Runner runner);
    // 3. 신규 소셜 연동 계정 등록
    int insertSocialAccount(RunnerSocialAccount runnerSocialAccount);
    // 4. 러너 ID로 러너 정보 조회
    Optional<Runner> findRunnerById(Long runnerId);
    // 5. 최근 로그인 일시 갱신
    int updateLastLoginAt(Long socialAccount);
}
