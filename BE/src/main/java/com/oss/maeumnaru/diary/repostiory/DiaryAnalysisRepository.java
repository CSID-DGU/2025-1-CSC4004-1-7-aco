package com.oss.maeumnaru.diary.repostiory;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DiaryAnalysisRepository extends JpaRepository<DiaryAnalysisEntity, Long> {
    // 다이어리 ID로 분석 정보 조회
    Optional<DiaryAnalysisEntity> findByDiary(DiaryEntity diary);
}
