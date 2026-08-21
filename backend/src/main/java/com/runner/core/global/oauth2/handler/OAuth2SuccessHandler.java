package com.runner.core.global.oauth2.handler;

import com.runner.core.auth.domain.RunnerRefreshToken;
import com.runner.core.auth.mapper.RefreshTokenMapper;
import com.runner.core.global.jwt.JwtTokenProvider;
import com.runner.core.runner.domain.Runner;
import com.runner.core.runner.domain.RunnerSocialAccount;
import com.runner.core.runner.mapper.RunnerMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final RunnerMapper runnerMapper;
    private final RefreshTokenMapper refreshTokenMapper;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken)authentication;
        String provider = authToken.getAuthorizedClientRegistrationId().toUpperCase(); // "GOOGLE", "NAVER"
        OAuth2User oAuth2User = authToken.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerUserId = extractProviderUserId(provider, attributes);

        log.info("Success Handler 실행 provider{}  providerUserId{}", provider, providerUserId);

        // 계정정보로 DB 조회
        Optional<RunnerSocialAccount> socialAccountOpt = runnerMapper.findSocialAccount(provider, providerUserId);

        if(socialAccountOpt.isEmpty()) {
            log.error("소셜 로그인 성공후 db 에서 회원정보를 찾을수 없습니다. provider:{}  providerUserId:{}", provider, providerUserId);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "회원 정보를 찾을수 업습니다.");
            return;
        }

        Long runnerId = socialAccountOpt.get().getRunnerId();

        // Runner 상세정보 조회
        Runner runner = runnerMapper.findRunnerById(runnerId).orElseThrow(
                ()->new IllegalArgumentException("회원정보를 찾을수 없습니다.")
        );

        // JWT token 생성
        String accessToken = jwtTokenProvider.createAccessToken(runnerId, runner.getNickname());
        String refreshToken = jwtTokenProvider.createRefreshToken(runnerId);

        // DB 에 refresh Token 저장 / 갱신
        refreshTokenMapper.upsertRefreshToken(RunnerRefreshToken.builder()
                        .runnerId(runnerId)
                        .refreshToken(refreshToken)
                        .build());

        log.info("JWT 토근 발급 완료 runnerId:{}  accessToken:{}", runnerId, accessToken);
        log.info("JWT 토근 발급 완료 refreshToken : {}", refreshToken);

        // 나중에 리다이렉트 될 URL 생성
        /*String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();
        // 프론트엔트로 리다이렉트
        getRedirectStrategy().sendRedirect(request, response, targetUrl);*/
        org.springframework.http.ResponseCookie cookie =
                org.springframework.http.ResponseCookie.from("refreshToken", refreshToken)
                        .httpOnly(true)
                        .secure(false) // https 운영 환경에서 true 로 변경
                        .path("/")
                        .maxAge(7*24*60*60) // 7일
                        .sameSite("Lax")
                        .build();

        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
        // url 에 토큰 노출하지 않고 리다이렉트
        getRedirectStrategy().sendRedirect(request, response, redirectUri);
    }

    private String extractProviderUserId (String provider, Map<String, Object> attributes) {
        if("GOOGLE".equalsIgnoreCase(provider)) {
            return (String)attributes.get("sub");
        } else if("NAVER".equalsIgnoreCase(provider)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = (Map<String, Object>)attributes.get("response");
            return responseMap != null?(String) responseMap.get("id"):null;
        }

        return null;
    }
}
