package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    // [일기 생성] - 파일 업로드와 함께 일기 생성
    @PostMapping
    public ResponseEntity<DiaryResponseDto> createDiary(
            @RequestParam Long memberId,  // 회원 ID
            @RequestPart("diary") DiaryRequestDto request,  // 일기 내용
            @RequestPart("file") MultipartFile file) throws IOException {  // 파일

        // 일기 생성 서비스 호출
        DiaryResponseDto response = diaryService.createDiary(memberId, request, file);

        // 일기 생성 성공 응답
        return ResponseEntity.ok(response);
    }

    // [일기 수정] - 파일을 수정하여 일기 수정
    @PutMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> updateDiary(
            @PathVariable("diaryId") Long diaryId,  // 수정할 일기 ID
            @RequestPart("diary") DiaryRequestDto request,  // 수정할 일기 내용
            @RequestPart("file") MultipartFile file) throws IOException {  // 수정할 파일

        // 일기 수정 서비스 호출
        DiaryResponseDto response = diaryService.updateDiary(diaryId, request, file);

        // 일기 수정 성공 응답
        return ResponseEntity.ok(response);
    }

    // [일기 삭제] - 일기 삭제
    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Void> deleteDiary(@PathVariable Long diaryId) {
        // 일기 삭제 서비스 호출
        diaryService.deleteDiary(diaryId);

        // 삭제 완료 응답
        return ResponseEntity.noContent().build();
    }

    // [일기 조회] - 특정 날짜의 일기 조회
    @GetMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> getDiaryById(@PathVariable Long diaryId) {
        Optional<DiaryResponseDto> diary = diaryService.getDiaryById(diaryId);
        // 값이 존재하면 반환, 없으면 404 처리
        return diary
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // [일기 조회] - 특정 회원 ID와 날짜로 일기 조회
    @GetMapping("/by-date")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesByMemberIdAndDate(
            @RequestParam Long memberId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        List<DiaryResponseDto> diaries = diaryService.getDiariesByMemberIdAndDate(memberId, date);
        return ResponseEntity.ok(diaries);
    }

    // [일기 조회] - 특정 회원 ID와 날짜 범위로 일기 조회
    @GetMapping("/by-range")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesByMemberIdAndDateRange(
            @RequestParam Long memberId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {
        List<DiaryResponseDto> diaries = diaryService.getDiariesByMemberIdAndDateRange(memberId, start, end);
        return ResponseEntity.ok(diaries);
    }
}
