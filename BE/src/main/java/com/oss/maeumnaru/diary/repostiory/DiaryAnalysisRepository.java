// DiaryAnalysisRepository.java
package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiaryAnalysisRepository extends JpaRepository<DiaryAnalysisEntity, Long> {
}