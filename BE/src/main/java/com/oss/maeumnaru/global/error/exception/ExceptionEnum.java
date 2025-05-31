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
    FINALIZED_PAINT_CANNOT_BE_UPDATED(400, "최종 확정된 그림은 수정할 수 없습니다."),


    //명상 오류
    MEDITATION_RETRIEVAL_FAILED(500, "명상 정보를 불러오는데 실패했습니다."),
    MEDITATION_NOT_FOUND(404, "해당 명상 정보를 찾을 수 없습니다."),
    MEDITATION_SAVE_FAILED(500, "명상 정보를 저장하는 데 실패했습니다."),
    MEDITATION_DELETE_FAILED(500, "명상 정보를 삭제하는 데 실패했습니다."),
    DATABASE_ERROR(500, "데이터베이스 오류가 발생했습니다."),

    // ✅ [User 관련 예외 추가]
    MEMBER_NOT_FOUND(404, "해당 회원을 찾을 수 없습니다."),
    DUPLICATE_LOGIN_ID(409, "이미 사용 중인 로그인 ID입니다."),
    INVALID_PASSWORD(401, "비밀번호가 일치하지 않습니다."),
    MISSING_LICENSE_NUMBER(400, "의사의 면허번호는 필수입니다."),
    S3_UPLOAD_FAILED(500, "파일 업로드 중 오류가 발생했습니다."),
    AUTHENTICATION_FAILED(401, "로그인 인증에 실패했습니다."),
    MEDICAL_NOT_FOUND(404, "의료 기록을 찾을 수 없습니다."),
    DOCTOR_NOT_FOUND(404, "해당 의사를 찾을 수 없습니다."),
    PATIENT_ALREADY_ASSIGNED(409, "해당 환자는 이미 다른 의사에게 배정되어 있습니다."),


    PAINT_NOT_FOUND(404, "해당 의사를 찾을 수 없습니다."),
    CHAT_ALREADY_START(404, "채팅이 이미 시작되었습니다." );
    private final int status;
    private final String message;

    ExceptionEnum(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public int getStatus() { return status; }
    public String getMessage() { return message; }
}
