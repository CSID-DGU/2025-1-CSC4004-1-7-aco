package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.service.DiaryService;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.jwt.SimpleUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<DiaryResponseDto> createDiary(
            Authentication authentication,
            @RequestPart("diary") DiaryRequestDto request,
            @RequestPart("file") MultipartFile file) {

        SimpleUserPrincipal principal = (SimpleUserPrincipal) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        DiaryResponseDto response = diaryService.createDiary(memberId, request, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> updateDiary(
            Authentication authentication,
            @PathVariable("diaryId") Long diaryId,
            @RequestPart("diary") DiaryRequestDto request,
            @RequestPart("file") MultipartFile file) {

        SimpleUserPrincipal principal = (SimpleUserPrincipal) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        DiaryResponseDto response = diaryService.updateDiary(memberId, diaryId, request, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Void> deleteDiary(
            Authentication authentication,
            @PathVariable Long diaryId) {

        SimpleUserPrincipal principal = (SimpleUserPrincipal) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        diaryService.deleteDiary(memberId, diaryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> getDiaryById(
            Authentication authentication,
            @PathVariable Long diaryId) {

        SimpleUserPrincipal principal = (SimpleUserPrincipal) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        return diaryService.getDiaryById(memberId, diaryId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesByMemberIdAndDate(
            Authentication authentication,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {

        SimpleUserPrincipal principal = (SimpleUserPrincipal) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        List<DiaryResponseDto> diaries = diaryService.getDiariesByMemberIdAndDate(memberId, date);
        return ResponseEntity.ok(diaries);
    }

    @GetMapping("/7days")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesForPast7Days(
            Authentication authentication,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date baseDate) {

        SimpleUserPrincipal principal = (SimpleUserPrincipal) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        List<DiaryResponseDto> diaries = diaryService.getDiariesByMemberIdForPast7Days(memberId, baseDate);
        return ResponseEntity.ok(diaries);
    }

}
