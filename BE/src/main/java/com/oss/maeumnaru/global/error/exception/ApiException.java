package com.oss.maeumnaru.global.error.exception;

import com.oss.maeumnaru.global.exception.ExceptionEnum;
import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final ExceptionEnum exceptionEnum;

    public ApiException(ExceptionEnum exceptionEnum) {
        super(exceptionEnum.getMessage());
        this.exceptionEnum = exceptionEnum;
    }
}
