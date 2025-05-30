package com.oss.maeumnaru.user.repository;

import com.oss.maeumnaru.user.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, String> {

    // 회원 ID로 환자 정보 조회
    Optional<PatientEntity> findByMember_MemberId(Long memberId);

    Optional<PatientEntity> findByPatientCode(String patientCode);
}
