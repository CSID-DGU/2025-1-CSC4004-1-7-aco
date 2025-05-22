package com.oss.maeumnaru.paint.dto;

import lombok.Getter;

@Getter
public class ChatRequestDto { //질문 - 응답 대화를 쌍으로 저장
    private Long paintId;
    private String chatbotComment;   // GPT 질문
    private String patientComment;   // 사용자 응답
}
