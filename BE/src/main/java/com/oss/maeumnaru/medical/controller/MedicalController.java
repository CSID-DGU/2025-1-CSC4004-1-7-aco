package com.oss.maeumnaru.medical.controller;

import com.oss.maeumnaru.medical.entity.MedicalEntity;
import com.oss.maeumnaru.medical.service.MedicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.oss.maeumnaru.medical.dto.MedicalResponseDto;

import java.util.List;

@RestController
@RequestMapping("/api/medical")
@RequiredArgsConstructor
public class MedicalController {

    private final MedicalService medicalService;

    // 특정 의사의 환자 목록 조회
    @GetMapping("/doctor/{licenseNumber}/patients")
    public ResponseEntity<List<MedicalResponseDto>> getPatientsByDoctor(@PathVariable String licenseNumber) {
        return ResponseEntity.ok(medicalService.getPatientsByDoctor(licenseNumber));
    }


    // 환자 추가
    @PostMapping("/doctor/{licenseNumber}/patient/{patientCode}")
    public ResponseEntity<MedicalEntity> addPatient(
            @PathVariable String licenseNumber,
            @PathVariable String patientCode) {
        return ResponseEntity.ok(medicalService.addPatientToDoctor(licenseNumber, patientCode));
    }

    // 환자 삭제
    @DeleteMapping("/{medicId}")
    public ResponseEntity<Void> removePatient(@PathVariable Long medicId) {
        medicalService.removePatient(medicId);
        return ResponseEntity.noContent().build();
    }
}