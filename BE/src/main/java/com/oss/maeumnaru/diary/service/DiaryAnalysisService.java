package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryAnalysisService {

    private final DiaryAnalysisRepository diaryAnalysisRepository;
    private final DiaryRepository diaryRepository;

    // 일기 분석 결과 저장 또는 수정
    @Transactional
    public DiaryAnalysisEntity saveAnalysis(Long diaryId, DiaryAnalysisRequestDto request) {
        try {
            DiaryEntity diary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));

            Optional<DiaryAnalysisEntity> existingAnalysisOpt = diaryAnalysisRepository.findByDiary_DiaryId(diaryId);
            DiaryAnalysisEntity analysis;

            if (existingAnalysisOpt.isPresent()) {
                analysis = existingAnalysisOpt.get();
                analysis.setEmotionRate(request.getEmotionRate());
                analysis.setMealCount(request.getMealCount());
                analysis.setWakeUpTime(request.getWakeUpTime());
                analysis.setWentOutside(request.isWentOutside());
            } else {
                analysis = DiaryAnalysisEntity.builder()
                        .diary(diary)
                        .emotionRate(request.getEmotionRate())
                        .mealCount(request.getMealCount())
                        .wakeUpTime(request.getWakeUpTime())
                        .wentOutside(request.isWentOutside())
                        .resultDate(new Date())
                        .build();
            }

            return diaryAnalysisRepository.save(analysis);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        }
    }


    // 특정 일기 ID로 분석 결과 조회
    public Optional<DiaryAnalysisEntity> findByDiaryId(Long diaryId) {
        try {
            return diaryAnalysisRepository.findByDiary_DiaryId(diaryId);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 최근 7일간 분석 결과 조회
    public List<DiaryAnalysisEntity> findWeeklyAnalysesByPatientCode(String patientCode, Date baseDate) {
        try {
            long MILLIS_IN_DAY = 24 * 60 * 60 * 1000L;
            Date startDate = new Date(baseDate.getTime() - MILLIS_IN_DAY * 6);
            Date endDate = new Date(baseDate.getTime() + MILLIS_IN_DAY - 1);

            return diaryAnalysisRepository.findByDiary_Patient_PatientCodeAndResultDateBetweenOrderByResultDateAsc(
                    patientCode, startDate, endDate);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
