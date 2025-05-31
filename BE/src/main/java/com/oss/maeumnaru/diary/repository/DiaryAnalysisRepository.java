package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
@Repository
public interface DiaryAnalysisRepository extends JpaRepository<DiaryAnalysisEntity, Long> {

    Optional<DiaryAnalysisEntity> findByDiary_DiaryId(Long diaryId);

    @Query("""
        SELECT dae
        FROM DiaryAnalysisEntity dae
        JOIN dae.diary d
        JOIN d.patient p
        WHERE p.patientCode = :patientCode
        AND FUNCTION('DATE_FORMAT', d.createDate, '%Y-%m-%d') BETWEEN :startDate AND :endDate
        ORDER BY d.createDate
    """)
    List<DiaryAnalysisEntity> findWeeklyAnalysesByPatientCode(
            @Param("patientCode") String patientCode,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate);
}
