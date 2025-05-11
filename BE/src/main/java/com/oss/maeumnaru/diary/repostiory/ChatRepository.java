package com.example.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ChatRepository extends JpaRepository<ChatEntity, Long> {
    // 특정 그림과 연결된 채팅들을 시간 순으로 조회
    List<ChatEntity> findByPaint_PaintIdOrderByChatDateAsc(Long paintId);
}