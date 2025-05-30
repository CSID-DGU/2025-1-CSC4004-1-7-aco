package com.oss.maeumnaru.paint.repository;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface PaintRepository extends JpaRepository<PaintEntity, Long> {

    // 메소드 이름으로 날짜와 환자 코드로 그림 조회

    Optional<PaintEntity> findByPatientCodeAndCreateDate(String patientCode, Date createDate);
}
