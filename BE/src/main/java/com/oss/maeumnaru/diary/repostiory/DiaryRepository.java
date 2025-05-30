package com.oss.maeumnaru.diary.repostiory;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity, Long> {
    // 회원 ID로 다이어리 전체 조회
    List<DiaryEntity> findByMember_MemberId(Long memberId);
}