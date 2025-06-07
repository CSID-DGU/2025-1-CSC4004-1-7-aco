package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.EmotionResponseDto;
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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmotionService {

    private final DiaryRepository diaryRepository;

    public List<EmotionResponseDto> getEmotionRatesByPatientCodeAndMonth(String patientCode, String year, String month) {
        try {
            List<Object[]> rows = diaryRepository.findEmotionRatesByPatientCodeAndYearAndMonth(patientCode, year, month);
            List<EmotionResponseDto> result = new ArrayList<>();

            for (Object[] row : rows) {
                Long diaryAnalysisId = ((Number) row[0]).longValue();
                String createDate = (String) row[1];
                Float emotionRate = row[2] != null ? ((Number) row[2]).floatValue() : null;

                result.add(EmotionResponseDto.builder()
                        .diaryAnalysisId(diaryAnalysisId)
                        .createDate(createDate)
                        .emotionRate(emotionRate)
                        .build());
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
