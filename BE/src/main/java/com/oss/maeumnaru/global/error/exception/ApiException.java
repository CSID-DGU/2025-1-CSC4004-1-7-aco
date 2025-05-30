package com.oss.maeumnaru.global.error.exception;

import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;

@Getter
public class ApiException extends RuntimeException {
    private final ExceptionEnum error;

    public ApiException(ExceptionEnum error) {
        super(error.getMessage());
        this.error = error;
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception e) {
        return ResponseEntity.status(500)
                .body(Map.of(
                        "status", 500,
                        "message", "알 수 없는 오류가 발생했습니다."
                ));
    }
    public ExceptionEnum getError() {
        return error;
    }
}
