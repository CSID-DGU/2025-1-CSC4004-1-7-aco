package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.EmotionResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmotionService {

    private final DiaryRepository diaryRepository;
    private final DiaryAnalysisRepository diaryAnalysisRepository;

    public List<EmotionResponseDto> getEmotionRatesByPatientCodeAndMonth(String patientCode, String year, String month) {
        try {
            return diaryRepository.findEmotionRatesByPatientCodeAndYearAndMonth(patientCode, year, month);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
