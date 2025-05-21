package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequestDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
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
    // 생성 또는 수정 (save는 존재하면 업데이트, 없으면 생성)
    @Transactional
    public DiaryAnalysisEntity saveAnalysis(Long diaryId, DiaryAnalysisRequestDto request) {
        // 일기 엔티티 조회
        DiaryEntity diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기가 존재하지 않습니다."));

        // DTO -> 엔티티 변환
        DiaryAnalysisEntity analysis = DiaryAnalysisEntity.builder()
                .diary(diary)
                .emotionRate(request.getEmotionRate())
                .mealCount(request.getMealCount())
                .wakeUpTime(request.getWakeUpTime())
                .wentOutside(request.isWentOutside())
                .diaryResultDate(new Date())  // 저장 시점으로 날짜 설정
                .build();

        // 기본 JpaRepository save() 사용
        return diaryAnalysisRepository.save(analysis);
    }


    public Optional<DiaryAnalysisEntity> findByDiaryId(Long diaryId) {
        return diaryAnalysisRepository.findById(diaryId);
    }

    // 기간 내 분석 결과 조회 (기준일 포함 최근 7일)
    public List<DiaryAnalysisEntity> findWeeklyAnalysesByMemberId(Long memberId, Date baseDate) {
        long MILLIS_IN_DAY = 24 * 60 * 60 * 1000L;
        Date startDate = new Date(baseDate.getTime() - MILLIS_IN_DAY * 6);  // 7일 전 (baseDate 포함)
        Date endDate = new Date(baseDate.getTime() + MILLIS_IN_DAY - 1);    // baseDate 하루 끝

        return diaryAnalysisRepository.findByDiary_Patient_Member_MemberIdAndDiaryResultDateBetweenOrderByDiaryResultDateAsc(
                memberId, startDate, endDate);
    }

}
