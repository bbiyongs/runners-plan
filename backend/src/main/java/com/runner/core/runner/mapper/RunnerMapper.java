package com.runner.core.runner.mapper;

import com.runner.core.runner.domain.Runner;
import com.runner.core.runner.domain.RunnerSocialAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface RunnerMapper {

    Optional<RunnerSocialAccount> findSocialAccount(@Param("provider") String provider, @Param("providerUserId") String providerUserId);

    void insertRunner(Runner runner);

    void insertSocialAccount(RunnerSocialAccount socialAccount);

    Optional<Runner> findRunnerById(@Param("runnerId") Long runnerId);

    void updateLastLoginAt(@Param("socialAccountId") Long socialAccountId);
}
