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


@Slf4j
@Service
@RequiredArgsConstructor
public class EmotionService {

    private final DiaryRepository diaryRepository;
    private final DiaryAnalysisRepository diaryAnalysisRepository;

    @Transactional
    public List<DiaryAnalysisResponseDto> getAnalysesByPatientCodeAndMonth(String patientCode, String year, String month) {
        try {
            String monthPrefix = String.format("%s-%02d", year, Integer.parseInt(month));

            List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDateStartingWith(patientCode, monthPrefix);

            if (diaries.isEmpty()) {
                return Collections.emptyList();
            }

            List<DiaryAnalysisResponseDto> result = new ArrayList<>();

            for (DiaryEntity diary : diaries) {
                try {
                    DiaryAnalysisEntity analysis = diary.getDiaryAnalysis();
                    if (analysis != null) {
                        result.add(DiaryAnalysisResponseDto.fromEntity(analysis));
                    }
                } catch (NullPointerException e) {
                    log.warn("Null analysis encountered for diaryId: {}", diary.getDiaryId());
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
