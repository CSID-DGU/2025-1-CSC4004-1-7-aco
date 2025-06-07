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

    // 💡 연-월 기준으로 diary_analysis_id join해서 emotion_rate 가져오는 Native Query
    @Query(value = """
        SELECT 
            da.diary_analysis_id AS diaryAnalysisId,
            d.create_date AS createDate,
            da.emotion_rate AS emotionRate
        FROM 
            diary d
        JOIN 
            diary_analysis da 
            ON d.diary_analysis_id = da.diary_analysis_id
        WHERE 
            d.patient_code = :patientCode
            AND SUBSTRING(d.create_date, 1, 4) = :year
            AND SUBSTRING(d.create_date, 6, 2) = :month
    """, nativeQuery = true)
    List<Object[]> findEmotionRatesByPatientCodeAndYearAndMonth(
            @Param("patientCode") String patientCode,
            @Param("year") String year,
            @Param("month") String month);
}
