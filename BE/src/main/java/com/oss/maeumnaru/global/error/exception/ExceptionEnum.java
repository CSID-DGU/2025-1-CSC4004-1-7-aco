package com.oss.maeumnaru.global.error.exception;

import lombok.Getter;

@Getter
public enum ExceptionEnum {
    DIARY_NOT_FOUND(404, "해당 일기를 찾을 수 없습니다."),
    ANALYSIS_NOT_FOUND(404, "해당 분석 결과가 존재하지 않습니다."),
    FORBIDDEN_ACCESS(403, "접근 권한이 없습니다."),
    INVALID_INPUT(400, "잘못된 요청입니다."),
    SERVER_ERROR(500, "서버 내부 오류가 발생했습니다."),
    PATIENT_NOT_FOUND(404, "회원의 환자 정보가 없습니다."),
    FILE_UPLOAD_FAILED(500, "파일 업로드에 실패했습니다."),
    //명상 오류
    MEDITATION_RETRIEVAL_FAILED(500, "명상 정보를 불러오는데 실패했습니다."),
    MEDITATION_NOT_FOUND(404, "해당 명상 정보를 찾을 수 없습니다."),
    MEDITATION_SAVE_FAILED(500, "명상 정보를 저장하는 데 실패했습니다."),
    MEDITATION_DELETE_FAILED(500, "명상 정보를 삭제하는 데 실패했습니다."),
    DATABASE_ERROR(500, "데이터베이스 오류가 발생했습니다.");



    private final int status;
    private final String message;

    ExceptionEnum(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public int getStatus() { return status; }
    public String getMessage() { return message; }
}
