package com.example.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity, Long> {
    // 회원 ID로 다이어리 전체 조회
    List<DiaryEntity> findByMember_MemberId(Long memberId);
}