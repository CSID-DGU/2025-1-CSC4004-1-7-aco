package com.oss.maeumnaru.medical.controller;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.jwt.SimpleUserPrincipal;
import com.oss.maeumnaru.medical.entity.MedicalEntity;
import com.oss.maeumnaru.medical.service.MedicalService;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.oss.maeumnaru.medical.dto.MedicalResponseDto;
import com.oss.maeumnaru.medical.dto.PatientResponseDto;

import java.util.List;

@RestController
@RequestMapping("/api/medical")
@RequiredArgsConstructor
public class MedicalController {

    private final MedicalService medicalService;

    // 👨‍⚕️ 로그인한 의사의 환자 목록 조회
    @GetMapping("/doctor/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<MedicalResponseDto>> getPatientsForCurrentDoctor(Authentication authentication) {
        Long memberId = ((SimpleUserPrincipal) authentication.getPrincipal()).getMemberId();
        return ResponseEntity.ok(medicalService.getPatientsByDoctor(memberId));
    }

    // 👨‍⚕️ 로그인한 의사가 특정 환자 연결
    @PostMapping("/doctor/patient/{patientCode}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalResponseDto> addPatient(
            Authentication authentication,
            @PathVariable String patientCode) {

        Long memberId = ((SimpleUserPrincipal) authentication.getPrincipal()).getMemberId();

        // 리턴값을 MedicalResponseDto로 직접 받아옴
        MedicalResponseDto response = medicalService.addPatientToDoctor(memberId, patientCode);

        return ResponseEntity.ok(response);
    }


    // 👨‍⚕️ 로그인한 의사가 관계 삭제
    @DeleteMapping("/doctor/patient/{medicId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> removePatient(
            Authentication authentication,
            @PathVariable Long medicId) {

        Long memberId = ((SimpleUserPrincipal) authentication.getPrincipal()).getMemberId();
        medicalService.removePatient(memberId, medicId);
        return ResponseEntity.noContent().build();
    }

    // 👁 환자 상세 조회 (누구나 조회 가능 or 추가 검증 가능)
    @GetMapping("/patient/{patientCode}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PatientResponseDto> getPatientDetail(@PathVariable String patientCode) {
        return ResponseEntity.ok(medicalService.getPatientDetail(patientCode));
    }
}
