package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;


import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class DiaryAnalysisService {

    private final DiaryAnalysisRepository diaryAnalysisRepository;
    private final DiaryRepository diaryRepository;
    private final S3Service s3Service;
    private final RestTemplate restTemplate;
    // 일기 분석 결과 저장 또는 수정
    @Transactional
    public DiaryAnalysisEntity saveAnalysis(Long diaryId, DiaryAnalysisRequestDto request) {
        try {
            // 1. 일기 조회
            DiaryEntity diary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));

            // 2. S3에서 일기 파일 다운로드 → 텍스트 추출
            byte[] fileBytes = s3Service.downloadFileAsBytes(diary.getContentPath());
            String actualText = new String(fileBytes, StandardCharsets.UTF_8);  // 인코딩 주의

            // 3. 감정 분석 서버에 JSON 전송
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", actualText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

            log.info("🔍 감정 분석 요청 시작 - 텍스트 길이: {}", actualText.length());

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "http://localhost:8000/predict", // FastAPI 분석 서버 엔드포인트
                    requestEntity,
                    Map.class
            );

            Map<String, Object> responseMap = response.getBody();

            if (responseMap == null || !responseMap.containsKey("emotion_score")) {
                log.warn("⚠ 감정 분석 응답에 emotion_score가 없습니다.");
                throw new ApiException(ExceptionEnum.SERVER_ERROR);
            }

            float emotionScore = ((Number) responseMap.get("emotion_score")).floatValue();
            Long emotionRate = (long) Math.round(emotionScore * 100); // 0~100 정수 변환

            log.info("✅ 감정 분석 완료 - emotionScore: {}, emotionRate: {}", emotionScore, emotionRate);

            // 4. 분석 결과 저장 (기존 분석이 있으면 업데이트)
            DiaryAnalysisEntity analysis = diary.getDiaryAnalysis();

            if (analysis != null) {
                analysis.setEmotionRate(emotionRate);
                analysis.setMealCount(request.getMealCount());
                analysis.setWakeUpTime(request.getWakeUpTime());
                analysis.setWentOutside(request.isWentOutside());
                analysis.setCreateDate(diary.getCreateDate());
                analysis.setResultDate(new Date());
                analysis.setAnalyzed(true);
            } else {
                analysis = DiaryAnalysisEntity.builder()
                        .emotionRate(emotionRate)
                        .mealCount(request.getMealCount())
                        .wakeUpTime(request.getWakeUpTime())
                        .wentOutside(request.isWentOutside())
                        .createDate(diary.getCreateDate())
                        .resultDate(new Date())
                        .analyzed(true)
                        .build();
                diary.setDiaryAnalysis(analysis);
            }

            return diaryAnalysisRepository.save(analysis);

        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }





    // 특정 일기 ID로 분석 결과 조회
    public Optional<DiaryAnalysisEntity> findByDiaryId(Long diaryId) {
        try {
            DiaryEntity diaryEntity = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));
            return Optional.ofNullable(diaryEntity.getDiaryAnalysis());
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 최근 7일간 분석 결과 조회
    @Transactional(readOnly = true)
    public List<DiaryAnalysisEntity> findWeeklyAnalysesByPatientCode(String patientCode, String baseDate) {
        try {
            System.out.println("Service 진입: findWeeklyAnalysesByPatientCode");
            System.out.println("입력된 patientCode: " + patientCode);
            System.out.println("입력된 baseDate: " + baseDate);

            // 날짜 파싱
            LocalDate base = LocalDate.parse(baseDate);

            // 시작일과 종료일 계산
            String startDate = base.minusDays(6).toString();  // 예: 2025-05-26
            String endDate = base.toString();                 // 예: 2025-06-01
            System.out.println("startDate: " + startDate);
            System.out.println("endDate: " + endDate);

            // DiaryEntity 목록 조회
            List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDateBetween(patientCode, startDate, endDate);
            System.out.println("조회된 일기 수: " + diaries.size());

            // DiaryAnalysisEntity만 추출
            List<DiaryAnalysisEntity> result = diaries.stream()
                    .map(DiaryEntity::getDiaryAnalysis)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            System.out.println("분석 결과 수: " + result.size());
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
