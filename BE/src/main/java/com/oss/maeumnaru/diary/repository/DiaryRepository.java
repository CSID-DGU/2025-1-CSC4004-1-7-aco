// DiaryRepository.java
package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.dto.EmotionResponseDto;
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

    // patientCode와 createDate를 기준으로 단일 조회
    Optional<DiaryEntity> findByPatient_PatientCodeAndCreateDate(String patientCode, String createDate);

    // patientCode와 createDate 범위로 조회
    List<DiaryEntity> findByPatient_PatientCodeAndCreateDateBetween(String patientCode, String startDate, String endDate);
    @Query("SELECT d FROM DiaryEntity d " +
            "WHERE d.patient.patientCode = :patientCode " +
            "AND d.createDate LIKE CONCAT(:year, '-', LPAD(:month, 2, '0'), '%')")
    List<DiaryEntity> findByPatientCodeAndYearAndMonth(
            @Param("patientCode") String patientCode,
            @Param("year") String year,
            @Param("month") String month
    );



}
