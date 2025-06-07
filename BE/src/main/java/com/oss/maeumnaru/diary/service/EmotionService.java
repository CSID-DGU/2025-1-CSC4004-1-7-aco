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
            // DiaryEntity 조회
            List<DiaryEntity> diaries = diaryRepository
                    .findByPatient_PatientCodeAndYearAndMonth(patientCode, year, month);

            List<EmotionResponseDto> result = new ArrayList<>();

            for (DiaryEntity diary : diaries) {
                Long diaryAnalysisId = diary.getDiaryAnalysis() != null
                        ? diary.getDiaryAnalysis().getDiaryAnalysisId()
                        : null;

                if (diaryAnalysisId != null) {
                    DiaryAnalysisEntity analysis = diaryAnalysisRepository.findById(diaryAnalysisId).orElse(null);
                    if (analysis != null && analysis.getEmotionRate() != null) {
                        result.add(EmotionResponseDto.builder()
                                .diaryAnalysisId(analysis.getDiaryAnalysisId())
                                .createDate(diary.getCreateDate())
                                .emotionRate(analysis.getEmotionRate())
                                .build());
                    }
                }
            }

            return result;
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
