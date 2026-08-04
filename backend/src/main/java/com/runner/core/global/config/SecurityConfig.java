package com.runner.core.global.config;

import com.runner.core.global.oauth2.handler.OAuth2SuccessHandler;
import com.runner.core.global.oauth2.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth->
                    auth.requestMatchers("/api/**", "/health", "/login/oauth2/**", "/oauth2/**").permitAll()
                    .anyRequest().permitAll()
            )
            .oauth2Login(oauth2->oauth2
                    .userInfoEndpoint(userInfo->userInfo.userService(customOAuth2UserService))
                    .successHandler(oAuth2SuccessHandler)
            );

        return http.build();
    }
}
