package com.oss.maeumnaru.paint.service;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
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
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(ExceptionEnum.OPENAI_API_KEY_MISSING);
        }
        System.out.println("Injected API Key = " + apiKey);
    }

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    // GPT에게 follow-up 질문을 생성 요청하는 메서드
    public String generateFollowUpQuestion(String patientReply) {
        OkHttpClient client = new OkHttpClient();

        JSONObject message1 = new JSONObject()
                .put("role", "system")
                .put("content", "당신은 감정 분석 상담사입니다. 채팅창 옆에는 사용자가 그린 그림이 띄워져있고 당신은 이 그림에 관해 사용자와 대화할 것입니다. 다만 당신은 그림을 볼 수 없으니 그림에 대해 불필요하게 유추하지 마십시오. 사용자의 응답에 따라 초반에는 그림의 의미를 탐색하는 질문을, 이후로는 사용자의 감정에 공감하고 위로하며 우울증 환자에게 도움이 될 수 있도록 대화를 이끌어주세요. 너무 길게 설명하지 말고 두세 문장으로만 대답해주세요.");

        JSONObject message2 = new JSONObject()
                .put("role", "user")
                .put("content", patientReply);

        JSONArray messages = new JSONArray()
                .put(message1)
                .put(message2);

        JSONObject body = new JSONObject()
                .put("model", "gpt-4o")
                .put("messages", messages)
                .put("max_tokens", 70)
                .put("temperature", 0.7);

        Request request = new Request.Builder()
                .url(API_URL)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(body.toString(), MediaType.parse("application/json")))
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.out.println("[GPT Error] HTTP " + response.code() + ": " + response.message());
                throw new ApiException(ExceptionEnum.OPENAI_API_CALL_FAILED);
            }

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
                throw new ApiException(ExceptionEnum.OPENAI_API_CALL_FAILED);
            } else {
                throw new ApiException(ExceptionEnum.OPENAI_API_CALL_FAILED);
            }

        } catch (IOException e) {
            System.out.println("[GPT Exception] IOException: " + e.getMessage());
            throw new ApiException(ExceptionEnum.OPENAI_API_CALL_FAILED);
        } catch (JSONException e) {
            System.out.println("[GPT Exception] JSONException: " + e.getMessage());
            throw new ApiException(ExceptionEnum.OPENAI_API_CALL_FAILED);
        } catch (Exception e) {
            System.out.println("[GPT Exception] Unknown error: " + e.getMessage());
            throw new ApiException(ExceptionEnum.OPENAI_API_CALL_FAILED);
        }
    }
}
