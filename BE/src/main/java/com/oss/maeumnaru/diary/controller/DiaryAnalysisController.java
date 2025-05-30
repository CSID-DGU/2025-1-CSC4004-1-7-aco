package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.service.DiaryAnalysisService;
import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.jwt.SimpleUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/diary/analysis")
@RequiredArgsConstructor
public class DiaryAnalysisController {

    private final DiaryAnalysisService diaryAnalysisService;
    // 연도(year)와 월(month)을 쿼리 파라미터로 받고, 토큰에서 사용자 ID 추출
    @GetMapping("/by-month")
    public ResponseEntity<List<DiaryAnalysisResponseDto>> getDiaryAnalysisByMonth(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam int year,
            @RequestParam int month) {

        Long memberId = principal.getMemberId();

        List<DiaryAnalysisResponseDto> analyses = diaryAnalysisService.getDiaryAnalysisByMonth(memberId, year, month);

        return ResponseEntity.ok(analyses);
    }

    // 분석 결과 저장 또는 수정
    @PostMapping("/{diaryId}")
    public ResponseEntity<DiaryAnalysisResponseDto> saveOrUpdateAnalysis(
            @PathVariable Long diaryId,
            @RequestBody DiaryAnalysisRequestDto request) {
        DiaryAnalysisEntity savedEntity = diaryAnalysisService.saveAnalysis(diaryId, request);
        return ResponseEntity.ok(DiaryAnalysisResponseDto.fromEntity(savedEntity));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<DiaryAnalysisResponseDto>> getWeeklyAnalysesByMemberId(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date baseDate,
            @RequestParam String patientCode) {

        List<DiaryAnalysisResponseDto> response = diaryAnalysisService.findWeeklyAnalysesByPatientCode(patientCode, baseDate)
                .stream()
                .map(DiaryAnalysisResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
    // 단일 일기 분석 결과 조회
    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryAnalysisResponseDto> getAnalysisByDiaryId(@PathVariable Long diaryId) {
        DiaryAnalysisEntity entity = diaryAnalysisService.findByDiaryId(diaryId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.ANALYSIS_NOT_FOUND));

        return ResponseEntity.ok(DiaryAnalysisResponseDto.fromEntity(entity));
    }
}
