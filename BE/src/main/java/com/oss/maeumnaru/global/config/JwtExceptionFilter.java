//package com.oss.maeumnaru.global.config;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.oss.maeumnaru.global.error.exception.ApiException;
//import com.oss.maeumnaru.global.exception.ExceptionEnum;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.MediaType;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.HashMap;
//import java.util.Map;
//
//@Slf4j
//public class JwtExceptionFilter extends OncePerRequestFilter {
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//        try {
//            filterChain.doFilter(request, response);
//        } catch (ApiException e) {
//            log.warn("JWT 필터 예외 발생: {}", e.getMessage());
//            setErrorResponse(response, e.getExceptionEnum());
//        }
//    }
//
//    private void setErrorResponse(HttpServletResponse response, ExceptionEnum exceptionEnum) throws IOException {
//        response.setStatus(exceptionEnum.getStatus().value());
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//
//        Map<String, Object> errorResponse = new HashMap<>();
//        errorResponse.put("status", exceptionEnum.getStatus().value());
//        errorResponse.put("error", exceptionEnum.getMessage());
//
//        ObjectMapper objectMapper = new ObjectMapper();
//        objectMapper.writeValue(response.getWriter(), errorResponse);
//    }
//}