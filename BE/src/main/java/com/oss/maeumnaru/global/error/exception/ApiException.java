package com.oss.maeumnaru.global.error.exception;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final ExceptionEnum error;

    public ApiException(ExceptionEnum error) {
        super(error.getMessage());
        this.error = error;
    }

    public ExceptionEnum getError() {
        return error;
    }
}
