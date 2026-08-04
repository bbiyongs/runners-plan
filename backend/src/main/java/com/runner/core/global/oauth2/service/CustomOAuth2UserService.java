package com.runner.core.global.oauth2.service;

import com.runner.core.global.oauth2.info.GoogleOAuth2UserInfo;
import com.runner.core.global.oauth2.info.NaverOAuth2UserInfo;
import com.runner.core.global.oauth2.info.OAuth2UserInfo;
import com.runner.core.runner.domain.Runner;
import com.runner.core.runner.domain.RunnerSocialAccount;
import com.runner.core.runner.mapper.RunnerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final RunnerMapper runnerMapper;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 기본 DefaultOAuth2UserService 을 통해 OAuth2User 가져오기
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 소셜 제공자 구분
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        log.info("OAuth2 Login 요청 - provider {}" , registrationId);
        log.info("OAuth2 Attributes : {}", attributes);

        // 규격에 맞는 객체 생성
        OAuth2UserInfo userInfo = null;
        if("google".equalsIgnoreCase(registrationId)) {
            userInfo = new GoogleOAuth2UserInfo(attributes);
        } else if ("naver".equalsIgnoreCase(registrationId)){
            userInfo = new NaverOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationException("지원하지 않는 소셜 로그인 제공가입니다. " + registrationId);
        }

        // db 조회 및 자동 회원가입
        Runner runner = processSocialUser(userInfo);

        // securityContext 에 저장될 OAuth2User 반환
        Map<String, Object> customAttributes = attributes;

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                customAttributes,
                userRequest.getClientRegistration().getProviderDetails()
                        .getUserInfoEndpoint().getUserNameAttributeName()
        );
    }

    private Runner processSocialUser(OAuth2UserInfo userInfo) {
        String provider = userInfo.getProvider();
        String providerId = userInfo.getProviderId();

        // 소셜 계정 연동여부
        Optional<RunnerSocialAccount> socialAccountOpt = runnerMapper.findSocialAccount(provider, providerId);

        if(socialAccountOpt.isPresent()) {
            RunnerSocialAccount socialAccount = socialAccountOpt.get();
            // 이미 존재
            log.info("기존 소셜 회원 로그인 {}" , socialAccount.getRunnerId());
            return runnerMapper.findRunnerById(socialAccount.getRunnerId())
                    .orElseThrow(()->new IllegalArgumentException("회원정보를 찾을수 없습니다. ID : " + socialAccount.getRunnerId()));
        }

        Runner newRunner = Runner.builder()
                .nickname(userInfo.getName())
                .profileImageUrl(userInfo.getProfileImageUrl())
                .build();
        runnerMapper.insertRunner(newRunner);

        RunnerSocialAccount newSocialAccount = RunnerSocialAccount.builder()
                .runnerId(newRunner.getRunnerId())
                .provider(provider)
                .providerUserId(providerId)
                .providerEmail(userInfo.getEmail())
                .isPrimary("Y")
                .build();
        runnerMapper.insertSocialAccount(newSocialAccount);

        log.info("신규 소셜 가입 완료 : runnerId {}" , newRunner.getRunnerId());
        return newRunner;
    }
}
