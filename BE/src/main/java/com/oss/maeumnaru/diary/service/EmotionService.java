package com.oss.maeumnaru.diary.service;


import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

import java.util.Collections;

import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class EmotionService {

    private final DiaryRepository diaryRepository;
    private final DiaryAnalysisRepository diaryAnalysisRepository;


    public List<DiaryAnalysisResponseDto> getAnalysesByPatientCodeAndMonth(String patientCode, String year, String month) {
        try {
            // 1. 해당 환자의 연-월 일기 조회
            List<DiaryEntity> diaries = diaryRepository
                    .findByPatientCodeAndYearAndMonth(patientCode, year, month);

            if (diaries.isEmpty()) {
                return Collections.emptyList();
            }

            // 2. diaryAnalysisId만 추출하여 조회
            List<DiaryAnalysisResponseDto> result = new ArrayList<>();

            for (DiaryEntity diary : diaries) {
                Long analysisId = diary.getDiaryAnalysis().getDiaryAnalysisId(); // <- 해당 getter 필요
                if (analysisId != null) {
                    diaryAnalysisRepository.findById(analysisId)
                            .ifPresent(analysis ->
                                    result.add(DiaryAnalysisResponseDto.fromEntity(analysis))
                            );
                }
            }

            return result;
        } catch (DataAccessException e) {
            log.error("Database error occurred", e);
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            log.error("Server error occurred", e);
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
