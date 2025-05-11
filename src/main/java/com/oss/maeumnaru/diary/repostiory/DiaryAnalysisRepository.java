package com.example.blog.Repository;

import com.example.blog.Entity.DiaryAnalysisEntity;
import com.example.blog.Entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DiaryAnalysisRepository extends JpaRepository<DiaryAnalysisEntity, Long> {
    // 다이어리 ID로 분석 정보 조회
    Optional<DiaryAnalysisEntity> findByDiary(DiaryEntity diary);
}
