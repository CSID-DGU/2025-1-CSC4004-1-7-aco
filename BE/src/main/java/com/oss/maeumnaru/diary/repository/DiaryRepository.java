// DiaryRepository.java
package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity, Long> {
    Optional<DiaryEntity> findByPatient_PatientCodeAndCreateDate(String patientCode, Date date);

    List<DiaryEntity> findByPatient_PatientCodeAndCreateDateBetween(String patientCode, Date startDate, Date endDate);
}
