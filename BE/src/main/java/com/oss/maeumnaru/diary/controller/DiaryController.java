package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisRequest;
import com.oss.maeumnaru.diary.dto.DiaryRequest;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    // [일기 등록]
    @PostMapping
    public ResponseEntity<DiaryEntity> createDiary(
            @RequestPart("diary") DiaryRequest diaryRequest,
            @RequestPart("file") MultipartFile contentFile) {
        DiaryEntity saved = diaryService.saveDiary(diaryRequest, contentFile);
        return ResponseEntity.ok(saved);
    }

    // [일기 조회]
    @GetMapping("/{diary_date}")
    public ResponseEntity<List<DiaryEntity>> getDiaryByDate(
            @PathVariable("diary_date") @DateTimeFormat(pattern = "yyyy-MM-dd") Date date,
            @RequestParam("memberId") Long memberId) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        Date startDate = cal.getTime();
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        Date endDate = cal.getTime();

        List<DiaryEntity> diaries = diaryService.getDiariesByDate(memberId, startDate, endDate);
        return ResponseEntity.ok(diaries);
    }

    // [일기 수정]
    @PutMapping("/{diary_id}")
    public ResponseEntity<DiaryEntity> updateDiary(
            @PathVariable("diary_id") Long diaryId,
            @RequestParam("newFile") MultipartFile newFile) {
        DiaryEntity updated = diaryService.updateDiary(diaryId, newFile);
        return ResponseEntity.ok(updated);
    }

    // [일기 삭제]
    @DeleteMapping("/{diary_id}")
    public ResponseEntity<Void> deleteDiary(@PathVariable("diary_id") Long diaryId) {
        diaryService.deleteDiary(diaryId);
        return ResponseEntity.noContent().build();
    }

    // [일기 분석 결과 조회]
    @PostMapping("/ai")
    public ResponseEntity<List<DiaryAnalysisEntity>> analyzeDiary(@RequestBody DiaryAnalysisRequest request) {
        try {
            Date baseDate = new SimpleDateFormat("yyyy-MM-dd").parse(request.getBaseDate());
            Calendar cal = Calendar.getInstance();
            cal.setTime(baseDate);
            cal.add(Calendar.DATE, -6);
            Date start = cal.getTime();
            Date end = baseDate;

            List<DiaryAnalysisEntity> weekly = diaryService.getWeeklyAnalysis(request.getMemberId(), start, end);
            return ResponseEntity.ok(weekly);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
