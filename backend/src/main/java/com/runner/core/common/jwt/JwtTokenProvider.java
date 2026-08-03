package com.runner.core.common.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
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

    // 1. Access Token 생성 (runnerId 및 nickname 포함)
    public String createAccessToken(Long runnerId, String nickname) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenExpiration);
        return Jwts.builder()
                .subject(String.valueOf(runnerId))
                .claim("nickname", nickname)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }
    // 2. Refresh Token 생성 (runnerId만 포함)
    public String createRefreshToken(Long runnerId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenExpiration);
        return Jwts.builder()
                .subject(String.valueOf(runnerId))
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }
    // 3. 토큰에서 러너 ID(runnerId) 추출
    public Long getRunnerIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.parseLong(claims.getSubject());
    }
    // 4. 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (SignatureException e) {
            log.error("잘못된 JWT 서명입니다: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("유효하지 않은 JWT 토큰입니다: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT 토큰이 비어있습니다: {}", e.getMessage());
        }
        return false;
    }
}
