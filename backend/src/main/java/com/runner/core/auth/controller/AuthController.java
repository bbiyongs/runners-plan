package com.runner.core.auth.controller;

import com.runner.core.auth.domain.RunnerRefreshToken;
import com.runner.core.auth.dto.response.AuthResponse;
import com.runner.core.auth.mapper.RefreshTokenMapper;
import com.runner.core.global.jwt.JwtTokenProvider;
import com.runner.core.global.response.ApiResponse;
import com.runner.core.runner.domain.Runner;
import com.runner.core.runner.mapper.RunnerMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenMapper refreshTokenMapper;
    private final RunnerMapper runnerMapper;

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @CookieValue(name="refreshToken", required = false) String refreshToken,
            HttpServletResponse response)
    {
        if(refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return ApiResponse.error("리프레시 토큰이 유효하지 않습니다.");
        }
        Long runnerId = jwtTokenProvider.getRunnerIdFromToken(refreshToken);

        // DB 에 저장된 토큰과 일치하는지 대조
        Optional<RunnerRefreshToken> savedTokenOpt = refreshTokenMapper.findByRunnerId(runnerId);
        if (savedTokenOpt.isEmpty() || !refreshToken.equals(savedTokenOpt.get().getRefreshToken())) {
            log.warn("[보안 경고] DB 토큰과 불일치하거나 이미 로그아웃된 토큰으로 재발급 시도!! runnerId {}", runnerId);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return ApiResponse.error("유효하지 않은 세션입니다. 다시 로그인 해주세요.");
        }

        // 러너 닉네임 조회 후 새로운 Access Token 지급
        String nickname = runnerMapper.findRunnerById(runnerId)
                .map(Runner::getNickname)
                .orElse("runner");

        String newAccessToken = jwtTokenProvider.createAccessToken(runnerId, nickname);

        AuthResponse authResponse = AuthResponse.builder()
                .grantType("Bearer")
                .accessToken(newAccessToken)
                .runnerId(runnerId)
                .nickname(nickname)
                .build();

        return ApiResponse.success("토큰 재발급 성공", authResponse);
    }

    // 로그아웃 시 httponly 쿠키 무효화
    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @CookieValue(name="refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        // 토큰 유효하면 db 에서 삭제
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            try {
                Long runnerId = jwtTokenProvider.getRunnerIdFromToken(refreshToken);
                refreshTokenMapper.deleteByRunnerId(runnerId);
                log.info("러너 로그아웃 db 세션 삭제 완료 {}", runnerId);
            } catch (Exception e) {
                log.warn("로그아웃 db 처리 중 오류 무시 : {}", e.getMessage());
            }
        }

        org.springframework.http.ResponseCookie cookie =
                org.springframework.http.ResponseCookie.from("refreshToken", "")
                        .httpOnly(true)
                        .path("/")
                        .maxAge(0)
                        .sameSite("Lax")
                        .build();

        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
        return ApiResponse.success("로그아웃 완료", null);
    }
}
