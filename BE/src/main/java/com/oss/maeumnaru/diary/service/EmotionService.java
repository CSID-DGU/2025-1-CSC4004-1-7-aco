package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmotionService {

    private final DiaryRepository diaryRepository;

    // 연-월 조회만 사용
    public List<DiaryResponseDto> getDiariesByPatientCodeAndMonth(String patientCode, String year, String month) {
        try {
            List<DiaryEntity> diaries = diaryRepository
                    .findByPatient_PatientCodeAndYearAndMonth(patientCode, year, month);

            return diaries.stream()
                    .map(DiaryResponseDto::fromEntity)
                    .collect(Collectors.toList());
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
