package com.oss.maeumnaru.paint.controller;

import com.oss.maeumnaru.global.config.CustomUserDetails;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.paint.dto.PaintResponseDto;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.paint.service.PaintService;
import com.oss.maeumnaru.user.entity.PatientEntity;
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
    private void validateOwnership(Long paintId, Long memberId) {
        PaintEntity paintEntity = paintService.getPaintEntityById(paintId);
        String patientCode = paintEntity.getPatient().getPatientCode();

        PatientEntity patientEntity = patientRepository.findByPatientCode(patientCode)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

        Long ownerMemberId = patientEntity.getMember().getMemberId();
        if (!ownerMemberId.equals(memberId)) {
            throw new ApiException(ExceptionEnum.FORBIDDEN_ACCESS);
        }
    }


    private String getPatientCodeByMemberId(Long memberId) {
        return patientRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND))
                .getPatientCode();
    }
    //ID로 그림 조회 - 환자가
    @GetMapping("/by-date")
    public ResponseEntity<PaintResponseDto> getPaintByPatientCodeAndDate(
            Authentication authentication,
            @RequestParam String date) {
            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            Long memberId = principal.getMemberId();
            String patientCode = getPatientCodeByMemberId(memberId);

        return paintService.findByPatient_PatientCodeAndCreateDate(patientCode, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // 임시저장
    @PostMapping(value = "/draft", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaintResponseDto> saveOrUpdatePaintDraft(
            @RequestParam(required = false) Long paintId,
            @RequestPart MultipartFile file,
            @RequestPart PaintRequestDto dto,
            Authentication authentication) throws IOException {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        String patientCode = getPatientCodeByMemberId(memberId);

        if (paintId != null) {
            validateOwnership(paintId, memberId);
            PaintResponseDto updatedPaint = paintService.updatePaintById(paintId, file, dto);
            return ResponseEntity.ok(updatedPaint);
        } else {
            PaintResponseDto savedPaint = paintService.savePaintDraft(patientCode, file, dto);
            return ResponseEntity.ok(savedPaint);
        }
    }


    // 최종저장(수정사항 반영 + 대화시작 + 이후 수정불가)
    @PostMapping("/finalize")
    public ResponseEntity<Void> finalizePaint(
            Authentication authentication,
            @RequestPart MultipartFile file,
            @RequestPart PaintRequestDto dto) throws IOException {
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        String patientCode = getPatientCodeByMemberId(memberId);
        paintService.finalizePaint(patientCode, file, dto);
        return ResponseEntity.ok().build();
    }

    //그림 삭제
    @DeleteMapping("/{paintId}")
    public ResponseEntity<Void> deletePaint(
            @PathVariable("paintId") Long id,
            Authentication authentication ) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        validateOwnership(id, memberId);

        paintService.deletePaint(id);
        return ResponseEntity.noContent().build();
    }

    //의사가 대화 조회에 사용
    @GetMapping("/{paintId}/chats")
    public ResponseEntity<List<ChatEntity>> getChatsByPaintId(
            @PathVariable("paintId") Long id,
            Authentication authentication) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        validateOwnership(id, memberId);

        return ResponseEntity.ok(chatRepository.findByPaint_PaintIdOrderByChatDateAsc(id));
    }

    // 응답과 다음 질문
    @PostMapping("/{paintId}/chat/reply")
    public ResponseEntity<String> saveReplyAndGetNextQuestion(
            @PathVariable Long id,
            @RequestBody String patientReply,
            Authentication authentication) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        // 🔒 소유자 검증
        validateOwnership(id, memberId);

        String nextQuestion = paintService.saveReplyAndGetNextQuestion(id, patientReply);
        return ResponseEntity.ok(nextQuestion);
    }

    //채팅 완료 -> 대화 전체 리스트 받음
    @PostMapping("/{paintId}/chat/complete")
    public ResponseEntity<Void> completeChat(
            @PathVariable Long id,
            @RequestBody List<ChatRequestDto> chatList,
            Authentication authentication ) {

        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = principal.getMemberId();

        // 🔒 소유자 검증
        validateOwnership(id, memberId);

        paintService.saveCompleteChat(id, chatList);
        return ResponseEntity.ok().build();
    }

}
