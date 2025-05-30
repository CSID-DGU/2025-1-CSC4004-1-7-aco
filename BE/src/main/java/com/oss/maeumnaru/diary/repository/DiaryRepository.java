// DiaryRepository.java
package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity, Long> {
    Optional<DiaryEntity> findByPatient_PatientCodeAndCreateDate(String patientCode, Date date);

    List<DiaryEntity> findByPatient_PatientCodeAndCreateDateBetween(String patientCode, Date startDate, Date endDate);
    // 연-월 조회용 JPQL
    @Query("SELECT d FROM DiaryEntity d " +
            "WHERE d.patient.patientCode = :patientCode " +
            "AND FUNCTION('YEAR', d.createDate) = :year " +
            "AND FUNCTION('MONTH', d.createDate) = :month")
    List<DiaryEntity> findByPatient_PatientCodeAndYearAndMonth(
            @Param("patientCode") String patientCode,
            @Param("year") int year,
            @Param("month") int month);
}
