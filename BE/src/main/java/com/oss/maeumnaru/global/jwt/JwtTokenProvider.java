package com.oss.maeumnaru.global.jwt;

import com.oss.maeumnaru.global.redis.TokenRedis;
import com.oss.maeumnaru.global.redis.TokenRedisRepository;
import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import com.oss.maeumnaru.global.config.CustomUserDetails;


import java.io.IOException;
import java.security.Key;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.cookieResponseDomain}")
    private String cookieResponseDomain;

    private final TokenRedisRepository tokenRedisRepository;

    private Key key;
    private static final String AUTHORITIES_KEY = "auth";

    @PostConstruct
    protected void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // JwtTokenProvider.java 내부
    public record TokenPair(String accessToken, String refreshToken) {}

    public TokenPair generateTokenPair(Authentication authentication) {
        String authorities = authentication.getAuthorities().isEmpty()
                ? "ROLE_USER"
                : authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.isBlank())
                .collect(Collectors.joining(","));

        String accessToken = Jwts.builder()
                .setSubject(((CustomUserDetails) authentication.getPrincipal()).getLoginId())  // ✅ loginId 확실히 보장
                .claim(AUTHORITIES_KEY, authorities)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        String refreshToken = Jwts.builder()
                .setSubject(authentication.getName())
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        return new TokenPair(accessToken, refreshToken);
    }

    public void saveCookie(HttpServletResponse response, String accessToken) {
        Cookie cookie = new Cookie("accessToken", accessToken);
        cookie.setPath("/");
        cookie.setDomain(cookieResponseDomain);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(60 * 30); // 30분
        response.addCookie(cookie);
    }

    public void clearCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("accessToken", null);
        cookie.setPath("/");
        cookie.setDomain(cookieResponseDomain);
        cookie.setMaxAge(0); // 즉시 만료
        response.addCookie(cookie);
    }

    public boolean validateToken(String token, HttpServletResponse response) throws IOException {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("만료된 액세스 토큰 사용!!", e);
            return false;
        } catch (Exception e) {
            log.error("Invalid JWT Token", e);
            response.sendRedirect("/error");
            return false;
        }
    }

    public UsernamePasswordAuthenticationToken createAuthenticationFromToken(String token, String memberId) {
        Authentication authentication = getAuthentication(token, memberId);
        return new UsernamePasswordAuthenticationToken(
                authentication.getPrincipal(),
                null,
                authentication.getAuthorities()
        );
    }

    public Authentication getAuthentication(String token, String memberId) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();

        String subject = "refresh".equals(claims.get("type", String.class)) ? memberId : claims.getSubject();

        String authString = claims.get(AUTHORITIES_KEY, String.class);
        if (authString == null || authString.isBlank()) {
            throw new RuntimeException("권한 정보가 없는 토큰입니다.");
        }

        Collection<? extends GrantedAuthority> authorities = Arrays.stream(authString.split(","))
                .filter(a -> !a.isBlank())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        User principal = new User(subject, "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public UsernamePasswordAuthenticationToken replaceAccessToken(HttpServletResponse response, String token) throws IOException {
        TokenRedis tokenRedis = tokenRedisRepository.findByAccessToken(token)
                .orElseThrow(() -> new RuntimeException("다시 로그인 해 주세요."));

        String refreshToken = tokenRedis.getRefreshToken();
        Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(refreshToken); // 유효성 검사

        String memberId = tokenRedis.getId();
        Authentication authentication = createAuthenticationFromToken(refreshToken, memberId);

        String newAccessToken = generateAccessToken(memberId, authentication.getAuthorities());

        saveCookie(response, newAccessToken);
        tokenRedis.updateAccessToken(newAccessToken);
        tokenRedisRepository.save(tokenRedis);

        return (UsernamePasswordAuthenticationToken) authentication;
    }

    private String generateAccessToken(String subject, Collection<? extends GrantedAuthority> authorities) {
        String auth = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.isBlank())
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(subject)
                .claim(AUTHORITIES_KEY, auth)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 30))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
