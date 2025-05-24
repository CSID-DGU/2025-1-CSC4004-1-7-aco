package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.service.DiaryService;
import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<DiaryResponseDto> createDiary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("diary") DiaryRequestDto request,
            @RequestPart("file") MultipartFile file) {

        Long memberId = userDetails.getMemberId();
        DiaryResponseDto response = diaryService.createDiary(memberId, request, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> updateDiary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("diaryId") Long diaryId,
            @RequestPart("diary") DiaryRequestDto request,
            @RequestPart("file") MultipartFile file) {

        Long memberId = userDetails.getMemberId();
        DiaryResponseDto response = diaryService.updateDiary(memberId, diaryId, request, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Void> deleteDiary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long diaryId) {

        Long memberId = userDetails.getMemberId();
        diaryService.deleteDiary(memberId, diaryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> getDiaryById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long diaryId) {

        Long memberId = userDetails.getMemberId();

        return diaryService.getDiaryById(memberId, diaryId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesByMemberIdAndDate(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {

        Long memberId = userDetails.getMemberId();
        List<DiaryResponseDto> diaries = diaryService.getDiariesByMemberIdAndDate(memberId, date);
        return ResponseEntity.ok(diaries);
    }

    @GetMapping("/7days")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesForPast7Days(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date baseDate) {

        Long memberId = userDetails.getMemberId();
        List<DiaryResponseDto> diaries = diaryService.getDiariesByMemberIdForPast7Days(memberId, baseDate);
        return ResponseEntity.ok(diaries);
    }
}
