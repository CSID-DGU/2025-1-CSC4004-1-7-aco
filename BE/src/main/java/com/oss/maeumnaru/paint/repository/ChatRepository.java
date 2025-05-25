package com.oss.maeumnaru.paint.repository;

import com.oss.maeumnaru.paint.entity.ChatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatEntity, Long> {
    // 특정 그림과 연결된 채팅들을 시간 순으로 조회
    List<ChatEntity> findByPaint_PaintIdOrderByChatDateAsc(Long paintId);
}