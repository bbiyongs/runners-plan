package com.runner.core.service.auth;

import com.runner.core.common.jwt.JwtTokenProvider;
import com.runner.core.domain.Runner;
import com.runner.core.domain.RunnerSocialAccount;
import com.runner.core.dto.request.SocialLoginRequest;
import com.runner.core.dto.response.AuthResponse;
import com.runner.core.mapper.RunnerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RunnerMapper runnerMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse loginOrRegisterSocialAccount(SocialLoginRequest request) {
        // 1. 기존 연동 소셜 계정 조회
        Optional<RunnerSocialAccount> optionalAccount = runnerMapper.findSocialAccount(
                request.getProvider(),
                request.getProviderUserId()
        );

        Long runnerId;
        String nickname;

        if(optionalAccount.isPresent()) {
            // 기존회원 : 최근 로그인 일시만 갱신
            RunnerSocialAccount account = optionalAccount.get();
            runnerId = account.getRunnerId();
            runnerMapper.updateLastLoginAt(account.getSocialAccountId());

            Runner runner = runnerMapper.findRunnerById(runnerId).orElseThrow(()->new IllegalArgumentException("존재하지 않는 러너입니다."));
            nickname = runner.getNickname();
        } else {
            //최초 소셜 접속 : 신규 생성
            nickname = (request.getNickname() != null)? request.getNickname() : "러너_" + request.getProviderUserId().substring(0,5);

            Runner newRunner = Runner.builder()
                    .nickname(nickname)
                    .profileImageUrl(request.getProfileImageUrl())
                    .build();

            runnerMapper.insertRunner(newRunner);
            runnerId = newRunner.getRunnerId(); // 자동생성된 PK

            RunnerSocialAccount newAccount = RunnerSocialAccount.builder()
                    .runnerId(runnerId)
                    .provider(request.getProvider())
                    .providerUserId(request.getProviderUserId())
                    .providerEmail(request.getProviderEmail())
                    .isPrimary("Y")
                    .build();

            runnerMapper.insertSocialAccount(newAccount);
        }

        String accessToken = jwtTokenProvider.createAccessToken(runnerId, nickname);
        String refreshToken = jwtTokenProvider.createRefreshToken(runnerId);

        return AuthResponse.builder()
                .grantType("Bearer")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .runnerId(runnerId)
                .nickname(nickname)
                .build();
    }
}