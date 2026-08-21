package com.runner.core.auth.mapper;

import com.runner.core.auth.domain.RunnerRefreshToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;


@Mapper
public interface RefreshTokenMapper {
    // 토큰 저장 또는 갱신
    void upsertRefreshToken(RunnerRefreshToken token);

    // 러너 ID 로 토큰 조회
    Optional<RunnerRefreshToken> findByRunnerId(@Param("runnerId") Long runnerId);

    // 로그아웃 시 토큰 삭제
    int deleteByRunnerId(@Param("runnerId") Long runnerId);
}
