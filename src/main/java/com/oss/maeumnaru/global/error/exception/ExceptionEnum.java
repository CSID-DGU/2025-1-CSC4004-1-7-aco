package com.oss.maeumnaru.global.error.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ExceptionEnum {
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    TIMEOUT_TOKEN(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    TOKEN_DOES_NOT_EXIST(HttpStatus.NOT_FOUND, "토큰이 존재하지 않습니다."),
    INVALID_TOKEN_INFO(HttpStatus.UNAUTHORIZED, "토큰 정보가 올바르지 않습니다.");

    private final HttpStatus status;
    private final String message;
}