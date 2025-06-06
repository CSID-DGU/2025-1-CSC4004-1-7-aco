package com.oss.maeumnaru.paint.service;

import jakarta.annotation.PostConstruct;
import okhttp3.*;
import org.json.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")
    private String apiKey;
    @PostConstruct
    public void checkKey() {
        System.out.println("Injected API Key = " + apiKey);
    }
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    // GPT에게 follow-up 질문을 생성 요청하는 메서드
    public String generateFollowUpQuestion(String patientReply) {
        // 실제 호출은 주석 처리하고, 테스트용 응답만 반환

        OkHttpClient client = new OkHttpClient();

        JSONObject message1 = new JSONObject()
                .put("role", "system")
                .put("content", "당신은 감정 분석 상담사입니다. 채팅창 옆에는 사용자가 그린 그림이 띄워져있고 당신은 이 그림에 관해 사용자와 대화할 것입니다. 사용자의 응답에 따라 사용자의 감정과 그림의 의미를 더 깊이 탐색할 수 있는 질문을 해주세요.");

        JSONObject message2 = new JSONObject()
                .put("role", "user")
                .put("content", patientReply);

        JSONArray messages = new JSONArray()
                .put(message1)
                .put(message2);

        JSONObject body = new JSONObject()
                .put("model", "o4-mini")
                .put("messages", messages)
                .put("max_tokens", 20)       // ← max_tokens 로 수정
                .put("temperature", 0.7);

        Request request = new Request.Builder()
                .url(API_URL)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(body.toString(), MediaType.parse("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            String responseBody = response.body().string();
            JSONObject result = new JSONObject(responseBody);
            if (result.has("choices")) {
                return result.getJSONArray("choices")
                        .getJSONObject(0)
                        .getJSONObject("message")
                        .getString("content");
            } else if (result.has("error")) {
                String errorMessage = result.getJSONObject("error").getString("message");
                System.out.println("[GPT Error] " + errorMessage);
                return "죄송합니다. GPT 호출 중 오류가 발생했어요: " + errorMessage;
            } else {
                return "죄송합니다. GPT의 응답 형식이 예상과 달랐습니다.";
            }

        } catch (IOException e) {
            return "응답을 바탕으로 어떤 감정이 더 느껴졌는지 알려주세요."; // fallback 질문
        }

        // ✅ GPT 연결 없이 테스트할 때 반환할 기본 질문
        //return "응답을 바탕으로 어떤 감정이 더 느껴졌는지 알려주세요? (GPT 호출 생략 중)";
    }
}
