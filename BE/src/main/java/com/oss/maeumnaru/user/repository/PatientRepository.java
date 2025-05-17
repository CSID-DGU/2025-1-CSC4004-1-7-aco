package com.oss.maeumnaru.user.repository;

import com.oss.maeumnaru.user.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, String> {

    // 회원 ID로 환자 정보 조회
    PatientEntity findByMember_MemberId(Long memberId);
}
