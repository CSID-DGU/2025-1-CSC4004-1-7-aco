package com.oss.maeumnaru.paint.controller;

import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.paint.dto.PaintResponseDto;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.paint.service.PaintService;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.oss.maeumnaru.paint.entity.ChatEntity;
import com.oss.maeumnaru.paint.repository.ChatRepository;
import com.oss.maeumnaru.paint.dto.ChatRequestDto;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.oss.maeumnaru.paint.dto.PaintRequestDto;
import org.springframework.http.MediaType;
import jakarta.validation.Valid;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/paint")
@RequiredArgsConstructor
public class PaintController {

    private final PaintService paintService;
    private final ChatRepository chatRepository;
    private final PatientRepository patientRepository;

    private String getPatientCodeByMemberId(Long memberId) {
        return patientRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND))
                .getPatientCode();
    }
    //ID로 그림 조회
    @GetMapping("/by-date")
    public ResponseEntity<PaintResponseDto> getPaintByPatientCodeAndDate(
            @RequestParam String patientCode,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {

        return paintService.getPaintByPatientCodeAndDate(patientCode, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // 임시저장
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaintResponseDto> savePaintDraft(
            Authentication authentication,
            @RequestPart MultipartFile file,
            @RequestPart PaintRequestDto dto) throws IOException {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        String patientCode = getPatientCodeByMemberId(memberId);
        PaintResponseDto response = paintService.savePaintDraft(patientCode, file, dto);
        return ResponseEntity.ok(response);
    }

    // 최종저장(수정사항 반영 + 대화시작 + 이후 수정불가)
    @PostMapping("/{id}/finalize")
    public ResponseEntity<Void> finalizePaint(
            @PathVariable Long id,
            @RequestPart MultipartFile file,
            @RequestPart PaintRequestDto dto) throws IOException {
        String patientCode = getPatientCodeByMemberId(id);
        paintService.finalizePaint(patientCode, file, dto);
        return ResponseEntity.ok().build();
    }

    //그림 수정
    @PutMapping("/{id}")
    public ResponseEntity<PaintResponseDto> updatePaint(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestPart("paint") PaintRequestDto dto,
            Authentication authentication) throws IOException {

        // 인증된 사용자 정보는 필요하다면 검증용으로 활용 가능
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        // paintId(id)를 기준으로 그림 업데이트
        PaintResponseDto updatedPaint = paintService.updatePaintById(id, file, dto);

        return ResponseEntity.ok(updatedPaint);
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