package com.oss.maeumnaru.paint.service;

import org.springframework.stereotype.Service;

@Service
public class OpenAiService {
    public String sendChatPrompt(String prompt) {
        // 실제 OpenAI API 호출 로직 작성
        // 예시 placeholder
        return "입력된 프롬프트: " + prompt + " → 이 그림은 평화롭고 따뜻한 느낌입니다.";

    }
}
