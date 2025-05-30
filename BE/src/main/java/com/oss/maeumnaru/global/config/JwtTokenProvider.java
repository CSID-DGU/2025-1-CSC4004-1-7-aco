//package com.oss.maeumnaru.global.config;
//
//import com.oss.maeumnaru.user.dto.response.TokenResponseDTO;
//
//import com.oss.maeumnaru.global.error.exception.ApiException;
//import com.oss.maeumnaru.global.exception.ExceptionEnum;
//import com.oss.maeumnaru.user.redis.RefreshTokenInfo;
//import com.oss.maeumnaru.user.redis.RefreshTokenInfoRedisRepository;
//
//import io.jsonwebtoken.*;
//import io.jsonwebtoken.io.Decoders;
//import io.jsonwebtoken.security.Keys;
//import io.jsonwebtoken.security.SignatureException;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.stereotype.Component;
//
//import java.security.Key;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Slf4j
//@Component
//public class JwtTokenProvider {
//
//    private final Key key;
//    private final RefreshTokenInfoRedisRepository refreshTokenInfoRepository;
//
//    public JwtTokenProvider(@Value("${jwt.secret}") String secretKey,
//                            RefreshTokenInfoRedisRepository refreshTokenInfoRepository) {
//        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
//        this.key = Keys.hmacShaKeyFor(keyBytes);
//        this.refreshTokenInfoRepository = refreshTokenInfoRepository;
//    }
//
//    public TokenResponseDTO generateToken(Authentication authentication) {
//        String authorities = authentication.getAuthorities().stream()
//                .map(GrantedAuthority::getAuthority)
//                .collect(Collectors.joining(","));
//
//        long now = (new Date()).getTime();
//        Date issuedAt = new Date();
//
//        String accessToken = Jwts.builder()
//                .setHeader(createHeaders())
//                .setSubject("accessToken")
//                .claim("iss", "off")
//                .claim("aud", authentication.getName())
//                .claim("auth", authorities)
//                .setExpiration(new Date(now + 1800000)) // 30분
//                .setIssuedAt(issuedAt)
//                .signWith(key, SignatureAlgorithm.HS256)
//                .compact();
//
//        String refreshToken = Jwts.builder()
//                .setHeader(createHeaders())
//                .setSubject("refreshToken")
//                .claim("iss", "off")
//                .claim("aud", authentication.getName())
//                .claim("auth", authorities)
//                .claim("add", "ref")
//                .setExpiration(new Date(now + 604800000)) // 7일
//                .setIssuedAt(issuedAt)
//                .signWith(key, SignatureAlgorithm.HS256)
//                .compact();
//
//        return TokenResponseDTO.of(accessToken, refreshToken);
//    }
//
//    public Authentication getAuthentication(String token) {
//        Claims claims = parseClaims(token);
//
//        if (claims.get("auth") == null) {
//            throw new RuntimeException("권한 정보가 없는 토큰입니다.");
//        }
//
//        Collection<? extends GrantedAuthority> authorities =
//                Arrays.stream(claims.get("auth").toString().split(","))
//                        .map(SimpleGrantedAuthority::new)
//                        .collect(Collectors.toList());
//
//        UserDetails principal = new User((String) claims.get("aud"), "", authorities);
//
//        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
//    }
//
//    public boolean validateToken(String token) {
//        try {
//            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
//            return true;
//        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
//            throw new ApiException(ExceptionEnum.INVALID_TOKEN);
//        } catch (ExpiredJwtException e) {
//            throw new ApiException(ExceptionEnum.TIMEOUT_TOKEN);
//        } catch (UnsupportedJwtException | IllegalArgumentException e) {
//            throw new ApiException(ExceptionEnum.INVALID_TOKEN);
//        } catch (Exception e) {
//            throw new ApiException(ExceptionEnum.INVALID_TOKEN);
//        }
//    }
//
//    public TokenResponseDTO refreshToken(String refreshToken) {
//        try {
//            Authentication authentication = getAuthentication(refreshToken);
//            RefreshTokenInfo redisRefreshTokenInfo =
//                    refreshTokenInfoRepository.findById(authentication.getName())
//                            .orElseThrow();
//
//            if (refreshToken.equals(redisRefreshTokenInfo.getRefreshToken())) {
//                TokenResponseDTO newTokens = generateToken(authentication);
//                saveToken(newTokens, authentication);
//                return newTokens;
//            } else {
//                log.warn("does not exist Token");
//                throw new ApiException(ExceptionEnum.TOKEN_DOES_NOT_EXIST);
//            }
//        } catch (NullPointerException e) {
//            log.warn("does not exist Token");
//            throw new ApiException(ExceptionEnum.TOKEN_DOES_NOT_EXIST);
//        } catch (SignatureException e) {
//            log.warn("Invalid Token Info");
//            throw new ApiException(ExceptionEnum.INVALID_TOKEN_INFO);
//        } catch (NoSuchElementException e) {
//            log.warn("no such Token value");
//            throw new ApiException(ExceptionEnum.TOKEN_DOES_NOT_EXIST);
//        }
//    }
//
//    private Claims parseClaims(String token) {
//        try {
//            return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
//        } catch (ExpiredJwtException e) {
//            return e.getClaims();
//        }
//    }
//
//    private static Map<String, Object> createHeaders() {
//        Map<String, Object> headers = new HashMap<>();
//        headers.put("alg", "HS256");
//        headers.put("typ", "JWT");
//        return headers;
//    }
//
//    // 예시: Redis에 Refresh Token 저장하는 메서드
//    private void saveToken(TokenResponseDTO tokenResponseDTO, Authentication authentication) {
//        RefreshTokenInfo tokenInfo = new RefreshTokenInfo(authentication.getName(), tokenResponseDTO.refreshToken());
//        refreshTokenInfoRepository.save(tokenInfo);
//    }
//}
