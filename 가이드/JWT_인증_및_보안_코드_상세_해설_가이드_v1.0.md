# 🔰 초보자를 위한 Running Coach JWT 인증 & 소셜 로그인 완전 정복 가이드 (v1.1)

**문서 작성일**: 2026년 8월 3일  
**작성자**: Running Coach 아키텍처 팀  
**대상**: 초보 개발자 및 JWT/Spring Security 입문자  
**목적**: 우리가 진행했던 실습 순서 그대로 순차적으로 따라하며 쉽게 이해할 수 있는 단계별 해설 문서  

---

## 🧭 1장. JWT & 소셜 로그인 전체 그림 그려보기

### 1.1 왜 JWT와 소셜 로그인을 쓸까요?
- **소셜 로그인 (OAuth2)**: 사용자가 비밀번호를 새로 외울 필요 없이 구글/네이버 계정으로 1초만에 간편 가입할 수 있습니다.
- **JWT (JSON Web Token)**: 로그인 성공 시 서버가 사용자에게 발급해 주는 **"디지털 신분증(암호화된 토큰)"**입니다. 서버에 세션을 저장하지 않으므로 서버 부하가 적고 빠르게 인증할 수 있습니다.

### 1.2 전체 동작 흐름 한눈에 보기
```text
[ 1. 클라이언트 (Postman / React) ]
              │  POST /api/v1/auth/social-login (JSON 데이터 전송)
              ▼
[ 2. AuthController ] ──> 요청 검증 (@Valid @RequestBody)
              │
              ▼
[ 3. AuthService ] ──(DB 조회)──> [ 4. RunnerMapper ] ──> [ 5. PostgreSQL DB ]
              │                                                │
              │ <──(최초 접속 시 신규 회원가입 & PK 채번)──────────┘
              │
              ├───> [ 6. JwtTokenProvider ] (30분 Access Token & 14일 Refresh Token 발급)
              │
              ▼
[ 7. AuthResponse ] ──> [ 8. 클라이언트에 Bearer 토큰 응답 완료! ]
```

---

## 📚 2장. 개발자의 비밀! 이 코드는 어디서 온 걸까?

초보자분들이 가장 많이 하시는 질문! **"이 긴 코드를 개발자들은 다 외워서 지나요?"**  
**대답은 "절대 아닙니다!"** 

개발자들도 공식 라이브러리 문서와 검증된 템플릿(Boilerplate)을 참고해서 가져온 뒤 자신의 프로젝트에 맞게 고쳐 씁니다.

| 구현 항목 | 참고 공식 출처 | 설명 |
| :--- | :--- | :--- |
| **JWT 토큰 생성/검증** | [JJWT 공식 GitHub (v0.12.x)](https://github.com/jwtk/jjwt) | `Jwts.builder()`, `Keys.hmacShaKeyFor()`, `verifyWith()` 등 표준 구문 |
| **보안 설정 (Security)**| [Spring Security 공식 문서](https://docs.spring.io/spring-security/site/docs/current/reference/html5/) | `SecurityFilterChain`, `AbstractHttpConfigurer::disable` 람다식 설정 |
| **DB 자동 PK 채번** | [MyBatis 공식 문서](https://mybatis.org/mybatis-3/ko/sqlmap-xml.html) | `useGeneratedKeys="true" keyProperty="runnerId"` 속성 |

---

## 🚀 3장. 순차적 따라하기 실습 가이드 (우리가 진행한 순서 그대로!)

---

### 🔹 Step 1. Git 새로운 작업 브랜치 생성하기
독립된 작업 공간을 만들기 위해 GitHub Desktop에서 브랜치를 만듭니다.
1. GitHub Desktop 상단 **`Current Branch`** 클릭 $ightarrow$ **`New Branch`** 클릭
2. 브랜치 이름: `feature/auth-jwt` 생성

---

### 🔹 Step 2. `build.gradle`에 JWT 라이브러리(JJWT) 추가하기
JWT 토큰을 자바에서 다루기 위한 공식 라이브러리 3개를 추가합니다.

**위치**: `backend/build.gradle`

```groovy
dependencies {
    // ... 기존 의존성들 ...

    // JWT 라이브러리 (io.jsonwebtoken v0.12.5)
    implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'
}
```
> **💡 필수 동작**: 코드 작성 후 IntelliJ 우측 상단 **`코끼리 아이콘 (Reload All Gradle Projects)`**을 눌러 동기화합니다.

---

### 🔹 Step 3. `application.yml`에 JWT 비밀키 및 만료시간 설정하기
서버가 사용할 마스터 암호키와 토큰 유효기간을 설정합니다.

**위치**: `backend/src/main/resources/application.yml`

```yaml
# JWT 설정
jwt:
  # 256비트(32바이트) 이상의 Base64 마스터 비밀키
  secret: c3VwZXItc2VjcmV0LWtleS1mb3ItcnVubmluZy1jb2FjaC1qd3QtdG9rZW4tZ2VuZXJhdGlvbi0yNTYtYml0cw==
  access-token-expiration: 1800000      # Access Token 만료시간: 30분 (1,800,000 ms)
  refresh-token-expiration: 1209600000  # Refresh Token 만료시간: 14일 (1,209,600,000 ms)
```

#### 💡 secret 비밀키 만드는 2가지 명령어
- **방법 1 (Git Bash 터미널)**: `openssl rand -base64 32` 입력
- **방법 2 (PowerShell 터미널)**: `python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"` 입력

---

### 🔹 Step 4. 도메인 엔티티 클래스 작성 (`Runner`, `RunnerSocialAccount`)
PostgreSQL DB 테이블과 1:1로 매핑되는 자바 클래스를 만듭니다.

#### 1) `Runner.java`
**위치**: `src/main/java/com/runner/core/domain/Runner.java`

```java
package com.runner.core.domain;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter // ⚠️ MyBatis가 자동 채번된 PK(runnerId)를 넣어주려면 @Setter가 필수입니다!
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Runner {
    private Long runnerId;           // 러너 PK
    private String nickname;         // 닉네임
    private String profileImageUrl;  // 프로필 이미지 URL
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### 2) `RunnerSocialAccount.java`
**위치**: `src/main/java/com/runner/core/domain/RunnerSocialAccount.java`

```java
package com.runner.core.domain;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter // ⚠️ MyBatis가 자동 채번된 PK(socialAccountId)를 넣어주려면 @Setter가 필수입니다!
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunnerSocialAccount {
    private Long socialAccountId;   // 소셜 계정 PK
    private Long runnerId;          // 러너 FK
    private String provider;        // GOOGLE, NAVER 등
    private String providerUserId;  // 소셜 고유 ID
    private String providerEmail;   // 이메일
    private String isPrimary;       // Y/N
    private LocalDateTime connectedAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### 🔹 Step 5. MyBatis 매퍼 인터페이스 & XML 작성
DB에 회원 정보를 조회하고 등록하는 SQL 쿼리를 만듭니다.

#### 1) `RunnerMapper.java` (인터페이스)
**위치**: `src/main/java/com/runner/core/mapper/RunnerMapper.java`

```java
package com.runner.core.mapper;

import com.runner.core.domain.Runner;
import com.runner.core.domain.RunnerSocialAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Optional;

@Mapper
public interface RunnerMapper {
    Optional<RunnerSocialAccount> findSocialAccount(@Param("provider") String provider, @Param("providerUserId") String providerUserId);
    int insertRunner(Runner runner);
    int insertSocialAccount(RunnerSocialAccount socialAccount);
    Optional<Runner> findRunnerById(Long runnerId);
    int updateLastLoginAt(Long socialAccountId);
}
```

#### 2) `RunnerMapper.xml` (SQL 파일)
**위치**: `src/main/resources/mapper/RunnerMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.runner.core.mapper.RunnerMapper">

    <!-- 1. 소셜 연동 계정 조회 (type-aliases-package 덕분에 RunnerSocialAccount 간략 표기 가능!) -->
    <select id="findSocialAccount" resultType="RunnerSocialAccount">
        SELECT 
            social_account_id AS socialAccountId,
            runner_id         AS runnerId,
            provider,
            provider_user_id  AS providerUserId,
            provider_email    AS providerEmail,
            is_primary        AS isPrimary,
            connected_at      AS connectedAt,
            last_login_at     AS lastLoginAt,
            created_at        AS createdAt,
            updated_at        AS updatedAt
        FROM RUNNER_SOCIAL_ACCOUNT
        WHERE provider = #{provider} AND provider_user_id = #{providerUserId}
    </select>

    <!-- 2. 신규 러너 등록 (useGeneratedKeys="true"가 PK를 채번해서 자바 객체에 넣음) -->
    <insert id="insertRunner" parameterType="Runner" useGeneratedKeys="true" keyProperty="runnerId" keyColumn="runner_id">
        INSERT INTO RUNNER (nickname, profile_image_url, created_at)
        VALUES (#{nickname}, #{profileImageUrl}, CURRENT_TIMESTAMP)
    </insert>

    <!-- 3. 신규 소셜 계정 등록 -->
    <insert id="insertSocialAccount" parameterType="RunnerSocialAccount" useGeneratedKeys="true" keyProperty="socialAccountId" keyColumn="social_account_id">
        INSERT INTO RUNNER_SOCIAL_ACCOUNT (
            runner_id, provider, provider_user_id, provider_email, is_primary, connected_at, last_login_at, created_at
        ) VALUES (
            #{runnerId}, #{provider}, #{providerUserId}, #{providerEmail}, #{isPrimary}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- 4. 최근 로그인 일시 갱신 -->
    <update id="updateLastLoginAt" parameterType="Long">
        UPDATE RUNNER_SOCIAL_ACCOUNT
        SET last_login_at = CURRENT_TIMESTAMP
        WHERE social_account_id = #{socialAccountId}
    </update>

    <!-- 5. 러너 정보 단건 조회 -->
    <select id="findRunnerById" parameterType="Long" resultType="Runner">
        SELECT runner_id AS runnerId, nickname, profile_image_url AS profileImageUrl, created_at AS createdAt, updated_at AS updatedAt
        FROM RUNNER WHERE runner_id = #{runnerId}
    </select>

</mapper>
```

---

### 🔹 Step 6. JWT 토큰 유틸리티 클래스 작성 (`JwtTokenProvider`)
토큰을 발급하고 검증하는 수문장 역할을 하는 클래스입니다.

**위치**: `src/main/java/com/runner/core/common/jwt/JwtTokenProvider.java`

```java
package com.runner.core.common.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    // 1. 30분짜리 Access Token 생성 (runnerId와 닉네임 저장)
    public String createAccessToken(Long runnerId, String nickname) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(runnerId))
                .claim("nickname", nickname)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessTokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    // 2. 14일짜리 Refresh Token 생성
    public String createRefreshToken(Long runnerId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(runnerId))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    // 3. 토큰에서 runnerId 추출 (누구의 토큰인가?)
    public Long getRunnerIdFromToken(String token) {
        Claims claims = Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
        return Long.parseLong(claims.getSubject());
    }

    // 4. 토큰 유효성 및 위변조/만료 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) { log.error("만료된 토큰입니다"); }
          catch (JwtException e) { log.error("유효하지 않은 토큰입니다"); }
        return false;
    }
}
```

---

### 🔹 Step 7. DTO 작성 (`SocialLoginRequest`, `AuthResponse`)
클라이언트와 주고받을 데이터 규격입니다.

#### 1) `SocialLoginRequest.java` (요청 DTO)
**위치**: `src/main/java/com/runner/core/dto/request/SocialLoginRequest.java`

```java
package com.runner.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SocialLoginRequest {
    @NotBlank(message = "소셜 제공자는 필수입니다")
    private String provider;           // GOOGLE, NAVER

    @NotBlank(message = "소셜 사용자 ID는 필수입니다")
    private String providerUserId;     // 12345

    private String providerEmail;
    private String nickname;
    private String profileImageUrl;
}
```

#### 2) `AuthResponse.java` (응답 DTO)
**위치**: `src/main/java/com/runner/core/dto/response/AuthResponse.java`

```java
package com.runner.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String grantType;     // "Bearer"
    private String accessToken;   // 30분짜리 토큰
    private String refreshToken;  // 14일짜리 토큰
    private Long runnerId;
    private String nickname;
}
```

---

### 🔹 Step 8. 소셜 로그인 비즈니스 로직 작성 (`AuthService`)
신규 회원이면 회원가입시키고, 기존 회원이면 로그인 일시만 업데이트한 뒤 토큰을 발급해 주는 메인 서비스입니다.

**위치**: `src/main/java/com/runner/core/service/auth/AuthService.java`

```java
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
        // 1. 소셜 계정 존재 여부 조회
        Optional<RunnerSocialAccount> optionalAccount = runnerMapper.findSocialAccount(request.getProvider(), request.getProviderUserId());

        Long runnerId;
        String nickname;

        if (optionalAccount.isPresent()) {
            // [CASE A] 기존 회원: 로그인 일시만 갱신
            RunnerSocialAccount account = optionalAccount.get();
            runnerId = account.getRunnerId();
            runnerMapper.updateLastLoginAt(account.getSocialAccountId());
            Runner runner = runnerMapper.findRunnerById(runnerId).orElseThrow();
            nickname = runner.getNickname();
        } else {
            // [CASE B] 신규 회원: RUNNER 및 RUNNER_SOCIAL_ACCOUNT 테이블에 INSERT (회원가입)
            nickname = (request.getNickname() != null) ? request.getNickname() : "러너_" + request.getProviderUserId();
            
            Runner newRunner = Runner.builder().nickname(nickname).profileImageUrl(request.getProfileImageUrl()).build();
            runnerMapper.insertRunner(newRunner); // DB에서 자동 생성된 runnerId 채워짐
            runnerId = newRunner.getRunnerId();

            RunnerSocialAccount newAccount = RunnerSocialAccount.builder()
                    .runnerId(runnerId)
                    .provider(request.getProvider())
                    .providerUserId(request.getProviderUserId())
                    .providerEmail(request.getProviderEmail())
                    .isPrimary("Y")
                    .build();
            runnerMapper.insertSocialAccount(newAccount);
        }

        // 2. JWT 토큰 쌍 발급
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
```

---

### 🔹 Step 9. REST API 컨트롤러 작성 (`AuthController`)
클라이언트의 HTTP 요청을 받아서 서비스를 실행하는 입구입니다.

**위치**: `src/main/java/com/runner/core/controller/auth/AuthController.java`

```java
package com.runner.core.controller.auth;

import com.runner.core.common.response.ApiResponse;
import com.runner.core.dto.request.SocialLoginRequest;
import com.runner.core.dto.response.AuthResponse;
import com.runner.core.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/social-login")
    public ApiResponse<AuthResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        AuthResponse response = authService.loginOrRegisterSocialAccount(request);
        return ApiResponse.success("소셜 로그인 성공", response);
    }
}
```

---

### 🔹 Step 10. 개발용 보안 접근 허용 설정 (`SecurityConfig`)
개발 초기 단계에서 모든 API 요청(`/api/**`)에 대해 로그인 팝업 없이 자유롭게 접근할 수 있도록 열어둡니다.

**위치**: `src/main/java/com/runner/core/config/SecurityConfig.java`

```java
package com.runner.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**", "/health").permitAll()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
```

---

### 🔹 Step 11. Postman으로 실제 API 호출 및 DB 생성 확인하기

1. **Spring Boot 실행**: IntelliJ에서 `BackendApplication` 실행
2. **Postman 설정 필수 체크 (가장 중요 ⭐)**:
   - **Method**: `POST`
   - **URL**: `http://localhost:8080/api/v1/auth/social-login`
   - **`Params` 탭이 아니라 ➔ `Body` 탭 클릭!**
   - **`raw` 선택 ➔ 우측 드롭다운을 `JSON`으로 변경!**
   - **입력 텍스트**:
     ```json
     {
       "provider": "GOOGLE",
       "providerUserId": "12345678",
       "providerEmail": "runner_kim@gmail.com",
       "nickname": "러너킴"
     }
     ```
3. **Send 버튼 클릭 시 결과**: `accessToken`과 `refreshToken`이 정상 반환됨!
4. **PostgreSQL DB 확인**: `docker exec -it runner_postgres psql -U runner_user -d runner_db` 실행 후 `SELECT * FROM runner;` 조회 시 회원 데이터가 자동으로 들어가 있는 것을 확인!

---

## ❓ 4장. 자주 묻는 질문(FAQ) & 트러블슈팅

### Q1. 왜 Postman에서 `Params`에 넣으면 `400 Bad Request` 에러가 나나요?
- `@RequestBody`는 HTTP 요청의 **JSON 본문(Body)**을 읽어오는 어노테이션입니다. `Params`는 URL 뒤에 붙는 파라미터(`?provider=GOOGLE`)이므로 Body 탭에서 JSON으로 전달해야 합니다.

### Q2. 왜 `Runner.java`에 `@Setter`가 없으면 `insertSocialAccount`에서 에러가 나나요?
- MyBatis의 `useGeneratedKeys="true"` 설정은 DB가 새로 채번한 PK 번호를 `runner.setRunnerId(채번된번호)` 형태로 자바 객체에 다시 주입합니다. 따라서 자바 클래스 상단에 **`@Setter`**가 반드시 필요합니다.

---
