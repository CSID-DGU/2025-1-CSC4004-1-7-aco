package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.service.DiaryService;
import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.jwt.SimpleUserPrincipal;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;
    private final PatientRepository patientRepository;

    private String getPatientCodeByMemberId(Long memberId) {
        return patientRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND))
                .getPatientCode();
    }

    @PostMapping
    public ResponseEntity<DiaryResponseDto> createDiary(
            Authentication authentication,
            @RequestPart("diary") DiaryRequestDto request,
            @RequestPart("file") MultipartFile file) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        String patientCode = getPatientCodeByMemberId(memberId);

        DiaryResponseDto response = diaryService.createDiary(patientCode, request, file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{diaryId}")
    public ResponseEntity<DiaryResponseDto> updateDiary(
            Authentication authentication,
            @PathVariable("diaryId") Long diaryId,
            @RequestPart("diary") DiaryRequestDto request,
            @RequestPart("file") MultipartFile file) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        String patientCode = getPatientCodeByMemberId(memberId);

        DiaryResponseDto response = diaryService.updateDiary(patientCode, diaryId, request, file);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{diaryId}")
    public ResponseEntity<Void> deleteDiary(
            Authentication authentication,
            @PathVariable Long diaryId) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        String patientCode = getPatientCodeByMemberId(memberId);

        diaryService.deleteDiary(patientCode, diaryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-date")
    public ResponseEntity<Optional<DiaryResponseDto>> getDiariesByMemberIdAndDate(
            Authentication authentication,
            @RequestParam String date) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        String patientCode = getPatientCodeByMemberId(memberId);

        Optional<DiaryResponseDto> diary = diaryService.getDiaryByPatientCodeAndDate(patientCode, date);
        return ResponseEntity.ok(diary);
    }
}
