package com.oss.maeumnaru.diary.service;


import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

import java.util.Collections;

import java.util.List;
import java.util.Objects;


@Slf4j
@Service
@RequiredArgsConstructor
public class EmotionService {

    private final DiaryRepository diaryRepository;
    private final DiaryAnalysisRepository diaryAnalysisRepository;

    @Transactional
    public List<DiaryAnalysisResponseDto> getAnalysesByPatientCodeAndMonth(String patientCode, String year, String month) {
        try {
            // yyyy-MM prefix 만들기
            String monthPrefix = String.format("%s-%02d", year, Integer.parseInt(month));

            // 해당 월의 일기 조회
            List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDateStartingWith(patientCode, monthPrefix);

            // 분석만 추출하여 DTO로 변환
            return diaries.stream()
                    .map(DiaryEntity::getDiaryAnalysis)
                    .filter(Objects::nonNull)
                    .map(DiaryAnalysisResponseDto::fromEntity)
                    .toList();

        } catch (DataAccessException e) {
            log.error("Database error occurred", e);
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            log.error("Server error occurred", e);
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }



}
