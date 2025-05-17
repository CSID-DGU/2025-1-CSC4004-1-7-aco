// JwtAuthenticationFilter.java
package com.oss.maeumnaru.global.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.debug("JwtAuthenticationFilter: doFilterInternal 시작");

        Optional<Cookie> accessTokenCookie = getCookie(request, "accessToken");

        if (accessTokenCookie.isPresent()) {
            String accessToken = accessTokenCookie.get().getValue();
            boolean valid = jwtTokenProvider.validateToken(accessToken, response);

            UsernamePasswordAuthenticationToken authentication;

            if (valid) {
                authentication = jwtTokenProvider.createAuthenticationFromToken(accessToken, null);
            } else {
                authentication = jwtTokenProvider.replaceAccessToken(response, accessToken);
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals(name))
                .findFirst();
    }
}
