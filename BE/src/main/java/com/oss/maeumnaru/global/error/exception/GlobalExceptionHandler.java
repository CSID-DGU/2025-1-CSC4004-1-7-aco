package com.oss.maeumnaru.global.error.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> handleApiException(ApiException e) {
        ExceptionEnum error = e.getError();  // 또는 getExceptionEnum() 중 하나 사용
        return ResponseEntity.status(error.getStatus())
                .body(Map.of(
                        "status", error.getStatus(),
                        "message", error.getMessage()
                ));
    }
    // 다른 예외 핸들러 추가 가능
}
