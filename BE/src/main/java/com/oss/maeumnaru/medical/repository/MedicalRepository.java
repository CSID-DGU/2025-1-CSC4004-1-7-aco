package com.oss.maeumnaru.medical.repository;

import com.oss.maeumnaru.medical.entity.MedicalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRepository extends JpaRepository<MedicalEntity, Long> {

    // 의사 기준 환자 목록 조회
    List<MedicalEntity> findByDoctor(DoctorEntity doctor);

    // 특정 환자가 이미 등록되어 있는지 확인
    Optional<MedicalEntity> findByPatient(PatientEntity patient);
}
