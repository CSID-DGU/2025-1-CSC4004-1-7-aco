package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequestDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiaryAnalysisService {

    private final DiaryAnalysisRepository diaryAnalysisRepository;
    private final DiaryRepository diaryRepository;

    // 일기 분석 결과 저장 또는 수정
    @Transactional
    public DiaryAnalysisEntity saveAnalysis(Long diaryId, DiaryAnalysisRequestDto request) {
        // 일기 조회
        DiaryEntity diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기가 존재하지 않습니다."));

        // 기존 분석 결과가 있는지 확인 (업데이트 시)
        Optional<DiaryAnalysisEntity> existingAnalysisOpt = diaryAnalysisRepository.findByDiary_DiaryId(diaryId);
        DiaryAnalysisEntity analysis;

        if (existingAnalysisOpt.isPresent()) {
            // 기존 분석 결과 수정
            analysis = existingAnalysisOpt.get();
            analysis.setEmotionRate(request.getEmotionRate());
            analysis.setMealCount(request.getMealCount());
            analysis.setWakeUpTime(request.getWakeUpTime());
            analysis.setWentOutside(request.isWentOutside());
        } else {
            // 새 분석 결과 생성
            analysis = DiaryAnalysisEntity.builder()
                    .diary(diary)
                    .emotionRate(request.getEmotionRate())
                    .mealCount(request.getMealCount())
                    .wakeUpTime(request.getWakeUpTime())
                    .wentOutside(request.isWentOutside())
                    .resultDate(new Date()) // 생성일자 설정
                    .build();
        }

        // 저장 (새로 생성하거나 수정)
        return diaryAnalysisRepository.save(analysis);
    }

    // 특정 일기 ID로 분석 결과 조회
    public Optional<DiaryAnalysisEntity> findByDiaryId(Long diaryId) {
        return diaryAnalysisRepository.findByDiary_DiaryId(diaryId);
    }

    // 최근 7일간 분석 결과 조회
    public List<DiaryAnalysisEntity> findWeeklyAnalysesByMemberId(Long memberId, Date baseDate) {
        long MILLIS_IN_DAY = 24 * 60 * 60 * 1000L;
        Date startDate = new Date(baseDate.getTime() - MILLIS_IN_DAY * 6);
        Date endDate = new Date(baseDate.getTime() + MILLIS_IN_DAY - 1);

        return diaryAnalysisRepository.findByDiary_Patient_Member_MemberIdAndResultDateBetweenOrderByResultDateAsc(
                memberId, startDate, endDate);
    }
}
