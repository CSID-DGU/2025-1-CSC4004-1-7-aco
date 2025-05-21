package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.service.DiaryAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/diary/analysis")
@RequiredArgsConstructor
public class DiaryAnalysisController {

    private final DiaryAnalysisService diaryAnalysisService;
    // 분석 결과 저장 또는 수정 API 테스트 o
    @PostMapping("/{diaryId}")
    public ResponseEntity<DiaryAnalysisResponseDto> saveOrUpdateAnalysis(
            @PathVariable Long diaryId,
            @RequestBody DiaryAnalysisRequestDto request) {

        DiaryAnalysisEntity savedEntity = diaryAnalysisService.saveAnalysis(diaryId, request);
        DiaryAnalysisResponseDto responseDto = DiaryAnalysisResponseDto.fromEntity(savedEntity);

        return ResponseEntity.ok(responseDto);
    }

    // 최근 7일간 분석 결과 조회 테스트 o
    @GetMapping("/weekly")
    public ResponseEntity<List<DiaryAnalysisResponseDto>> getWeeklyAnalysesByMemberId(
            @RequestParam Long memberId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date baseDate) {

        List<com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity> analyses =
                diaryAnalysisService.findWeeklyAnalysesByMemberId(memberId, baseDate);

        List<DiaryAnalysisResponseDto> response = analyses.stream()
                .map(DiaryAnalysisResponseDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 단일 일기 분석 결과 조회 테스트 o
    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryAnalysisResponseDto> getAnalysisByDiaryId(@PathVariable Long diaryId) {
        Optional<com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity> analysisOpt = diaryAnalysisService.findByDiaryId(diaryId);

        return analysisOpt
                .map(entity -> ResponseEntity.ok(DiaryAnalysisResponseDto.fromEntity(entity)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
