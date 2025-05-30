package com.oss.maeumnaru.diary.controller;

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

    private final EmotionService emotionService;
    private final MemberRepository memberRepository;

    @GetMapping("/mainpage")
    public ResponseEntity<List<DiaryResponseDto>> getDiariesByMonthAndYear(
            Authentication authentication,
            @RequestParam int year,
            @RequestParam int month) {

        // 1️⃣ 로그인 사용자 확인
        String loginId = authentication.getName();
        MemberEntity member = memberRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.MEMBER_NOT_FOUND));

        // 2️⃣ 환자 코드 조회
        String patientCode = member.getPatient() != null
                ? member.getPatient().getPatientCode()
                : null;

        if (patientCode == null) {
            throw new ApiException(ExceptionEnum.PATIENT_NOT_FOUND);
        }

        // 3️⃣ EmotionService 호출
        List<DiaryResponseDto> diaries = emotionService.getDiariesByPatientCodeAndMonth(patientCode, year, month);

        return ResponseEntity.ok(diaries);
    }
}
