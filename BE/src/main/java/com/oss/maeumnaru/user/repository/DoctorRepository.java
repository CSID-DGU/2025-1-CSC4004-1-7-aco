package com.oss.maeumnaru.user.repository;

import com.oss.maeumnaru.user.entity.DoctorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<DoctorEntity, String> {
    // 회원 ID로 의사 정보 조회
    Optional<DoctorEntity> findByMember_MemberId(Long memberId);
}
