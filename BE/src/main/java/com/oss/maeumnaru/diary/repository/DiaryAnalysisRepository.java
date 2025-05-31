package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
@Repository
public interface DiaryAnalysisRepository extends JpaRepository<DiaryAnalysisEntity, Long> {

    Optional<DiaryAnalysisEntity> findByDiary_DiaryId(Long diaryId);

    List<DiaryAnalysisEntity> findByDiary_Patient_PatientCodeAndDiary_CreateDateBetweenOrderByDiary_CreateDateAsc(
            String patientCode, String startDate, String endDate);
}
