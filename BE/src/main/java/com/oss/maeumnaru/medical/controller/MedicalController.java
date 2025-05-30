package com.oss.maeumnaru.medical.controller;

import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.service.DiaryService;
import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.jwt.SimpleUserPrincipal;
import com.oss.maeumnaru.medical.entity.MedicalEntity;
import com.oss.maeumnaru.medical.service.MedicalService;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.oss.maeumnaru.medical.dto.MedicalResponseDto;
import com.oss.maeumnaru.medical.dto.PatientResponseDto;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical")
@RequiredArgsConstructor
public class MedicalController {

    private final MedicalService medicalService;
    private final DiaryService diaryService;
    // 👨‍⚕️ 로그인한 의사의 환자 목록 조회
    @GetMapping("/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<MedicalResponseDto>> getPatientsForCurrentDoctor(Authentication authentication) {
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        return ResponseEntity.ok(medicalService.getPatientsByDoctor(memberId));
    }

    // 👨‍⚕️ 로그인한 의사가 특정 환자 연결
    @PostMapping("/{patientCode}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalResponseDto> addPatient(
            Authentication authentication,
            @PathVariable String patientCode) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        // 리턴값을 MedicalResponseDto로 직접 받아옴
        MedicalResponseDto response = medicalService.addPatientToDoctor(memberId, patientCode);

        return ResponseEntity.ok(response);
    }


    // 👨‍⚕️ 로그인한 의사가 관계 삭제
    @DeleteMapping("/{medicId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> removePatient(
            Authentication authentication,
            @PathVariable Long medicId) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();
        medicalService.removePatient(memberId, medicId);
        return ResponseEntity.noContent().build();
    }

    // 👁 환자 상세 조회 (누구나 조회 가능 or 추가 검증 가능)
    @GetMapping("/{patientCode}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PatientResponseDto> getPatientDetail(@PathVariable String patientCode) {
        return ResponseEntity.ok(medicalService.getPatientDetail(patientCode));
    }
    //의사 일기 조회
    @GetMapping("/diary/{patientCode}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Optional<DiaryResponseDto>> getPatientDiaryByDate(
            @PathVariable String patientCode,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        Optional<DiaryResponseDto> diary = diaryService.getDiaryByPatientCodeAndDate(patientCode, date);
        return ResponseEntity.ok(diary);
    }
}
