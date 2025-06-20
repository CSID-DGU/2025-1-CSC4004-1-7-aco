package com.oss.maeumnaru.diary.controller;

import com.oss.maeumnaru.diary.dto.DiaryAnalysisResponseDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.service.EmotionService;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.user.entity.MemberEntity;
import com.oss.maeumnaru.user.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class EmotionController {

    private final EmotionService EmotionService;
    private final MemberRepository MemberRepository;


    @GetMapping("/mainpage")
    public ResponseEntity<List<DiaryAnalysisResponseDto>> getDiariesByMonthAndYear(

            Authentication authentication,
            @RequestParam String year,
            @RequestParam String month) {

        String loginId = authentication.getName();
        MemberEntity member = MemberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.USER_NOT_FOUND));

        String patientCode = member.getPatient() != null
                ? member.getPatient().getPatientCode()
                : null;

        if (patientCode == null) {
            throw new ApiException(ExceptionEnum.PATIENT_NOT_FOUND);
        }


        List<DiaryAnalysisResponseDto> diaries = EmotionService.getAnalysesByPatientCodeAndMonth(patientCode, year, month);
        return ResponseEntity.ok(diaries);
    }
}
