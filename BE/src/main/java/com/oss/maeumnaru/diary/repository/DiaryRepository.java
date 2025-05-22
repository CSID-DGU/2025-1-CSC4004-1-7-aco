// DiaryRepository.java
package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity, Long> {
    List<DiaryEntity> findByPatient_PatientCodeAndCreateDateBetweenOrderByCreateDateAsc(String patientCode, Date start, Date end);

    List<DiaryEntity> findByPatient_PatientCodeAndCreateDate(String patientCode, Date date);
}
