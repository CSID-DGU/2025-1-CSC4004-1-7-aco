package com.oss.maeumnaru.paint.controller;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.paint.service.PaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.oss.maeumnaru.paint.entity.ChatEntity;
import com.oss.maeumnaru.paint.repository.ChatRepository;
import com.oss.maeumnaru.paint.dto.ChatRequestDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.oss.maeumnaru.paint.dto.PaintRequestDto;

import java.util.List;

@RestController
@RequestMapping("/api/paint")
@RequiredArgsConstructor
public class PaintController {

    private final PaintService paintService;
    private final ChatRepository chatRepository;

    //ID로 그림 조회
    @GetMapping("/{id}")
    public ResponseEntity<PaintEntity> getPaintById(@PathVariable Long id) {
        return paintService.getPaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 임시저장
    @PostMapping("/draft")
    public ResponseEntity<PaintEntity> savePaintDraft(
            @RequestPart MultipartFile file,
            @RequestPart PaintRequestDto dto) throws IOException {
        return ResponseEntity.ok(paintService.savePaintDraft(file, dto));
    }
    // 최종저장(수정사항 반영 + 대화시작 + 이후 수정불가)
    @PostMapping("/{id}/finalize")
    public ResponseEntity<Void> finalizePaint(
            @PathVariable Long id,
            @RequestPart MultipartFile file,
            @RequestPart PaintRequestDto dto) throws IOException {
        paintService.finalizePaint(id, file, dto);
        return ResponseEntity.ok().build();
    }

    //그림 수정
    @PutMapping("/{id}")
    public ResponseEntity<PaintEntity> updatePaint(@PathVariable Long id, @RequestBody PaintEntity updatedPaint) {
        try {
            return ResponseEntity.ok(paintService.updatePaint(id, updatedPaint));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    //그림 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaint(@PathVariable Long id) {
        paintService.deletePaint(id);
        return ResponseEntity.noContent().build();
    }

    //의사가 대화 조회에 사용
    @GetMapping("/{id}/chats")
    public ResponseEntity<List<ChatEntity>> getChatsByPaintId(@PathVariable Long id) {
        return ResponseEntity.ok(chatRepository.findByPaint_PaintIdOrderByChatDateAsc(id));
    }

    // 응답과 다음 질문
    @PostMapping("/{id}/chat/reply")
    public ResponseEntity<String> saveReplyAndGetNextQuestion(
            @PathVariable Long id,
            @RequestBody String patientReply) {

        String nextQuestion = paintService.saveReplyAndGetNextQuestion(id, patientReply);
        return ResponseEntity.ok(nextQuestion);
    }


    //채팅 완료 -> 대화 전체 리스트 받음
    @PostMapping("/{id}/chat/complete")
    public ResponseEntity<Void> completeChat(
            @PathVariable Long id,
            @RequestBody List<ChatRequestDto> chatList) {
        paintService.saveCompleteChat(id, chatList);
        return ResponseEntity.ok().build();
    }

}