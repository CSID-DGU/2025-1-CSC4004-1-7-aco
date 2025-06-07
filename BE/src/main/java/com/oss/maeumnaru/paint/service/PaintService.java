package com.oss.maeumnaru.paint.service;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.paint.dto.PaintResponseDto;
import com.oss.maeumnaru.paint.dto.PaintRequestDto;
import com.oss.maeumnaru.paint.entity.ChatEntity;
import com.oss.maeumnaru.paint.repository.ChatRepository;
import com.oss.maeumnaru.paint.repository.PaintRepository;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PaintService {

    private final PaintRepository paintRepository;
    private final PatientRepository patientRepository;
    private final ChatRepository chatRepository;
    private final OpenAiService openAiService;
    private final S3Service s3Service;

    // 날짜와 환자 코드로 그림 조회
    public Optional<PaintResponseDto> findByPatient_PatientCodeAndCreateDate(String patientCode, String date) {
        return paintRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date)
                .map(PaintResponseDto::fromEntity);
    }

    // ID로 그림 조회
    public PaintEntity getPaintEntityById(Long paintId) {
        return paintRepository.findById(paintId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));
    }

    // 그림 임시 저장
    public PaintResponseDto savePaintDraft(String patientCode, MultipartFile file, PaintRequestDto dto) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ApiException(ExceptionEnum.FILE_REQUIRED);
        }

        try {
            String fileUrl = s3Service.uploadFile(file, patientCode + "/paint", String.valueOf(dto.getCreateDate()));
            PatientEntity patientEntity = patientRepository.findByPatientCode(patientCode)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

            PaintEntity paint = PaintEntity.builder()
                    .fileUrl(fileUrl)
                    .patient(patientEntity)
                    .title(dto.getTitle())
                    .createDate(dto.getCreateDate())
                    .updateDate(new Date())
                    .build();

            PaintEntity savedPaint = paintRepository.save(paint);

            return new PaintResponseDto(
                    savedPaint.getPaintId(),
                    savedPaint.getFileUrl(),
                    savedPaint.getCreateDate(),
                    savedPaint.getUpdateDate(),
                    savedPaint.getPatient() != null ? savedPaint.getPatient().getPatientCode() : null,
                    savedPaint.getTitle(),
                    savedPaint.isChatCompleted()
            );

        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 그림 최종 저장
    public PaintResponseDto finalizePaint(String patientCode, MultipartFile file, PaintRequestDto dto) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ApiException(ExceptionEnum.FILE_REQUIRED);
        }

        try {
            String date = dto.getCreateDate();
            PatientEntity patientEntity = patientRepository.findByPatientCode(patientCode)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

            PaintEntity paint = paintRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

            boolean hasChat = !chatRepository.findByPaint_PaintIdOrderByChatDateAsc(paint.getPaintId()).isEmpty();
            if (hasChat) {
                throw new ApiException(ExceptionEnum.CHAT_ALREADY_START);
            }

            String fileUrl = s3Service.uploadFile(file, patientCode + "/paint", String.valueOf(dto.getCreateDate()));

            paint.setFileUrl(fileUrl);
            paint.setPatient(patientEntity);
            paint.setTitle(dto.getTitle());
            paint.setUpdateDate(new Date());

            paintRepository.save(paint);

            startChatWithPaint(paint);

            return new PaintResponseDto(
                    paint.getPaintId(),
                    paint.getFileUrl(),
                    paint.getCreateDate(),
                    paint.getUpdateDate(),
                    paint.getPatient() != null ? paint.getPatient().getPatientCode() : null,
                    paint.getTitle(),
                    paint.isChatCompleted()
            );

        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 대화 시작
    private static final List<String> PREDEFINED_QUESTIONS = List.of(
            "이 그림을 그릴 때 어떤 감정이었나요?",
            "이 그림은 무엇을 표현한 건가요?",
            "이 그림은 어떤 이야기를 들려주는 것 같나요?",
            "이 그림 속 인물이나 사물의 감정은 어떤가요?",
            "이 그림을 보면 어떤 기억이나 감정이 떠오르나요?"
    );

    private void startChatWithPaint(PaintEntity paint) {
        String question = PREDEFINED_QUESTIONS.get(new Random().nextInt(PREDEFINED_QUESTIONS.size()));
        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.CHATBOT)
                .chatDate(new Date())
                .comment(question)
                .build());
    }

    // 환자 응답과 다음 질문
    public String saveReplyAndGetNextQuestion(Long paintId, String patientReply) {
        PaintEntity paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

        if (paint.isChatCompleted()) {
            throw new ApiException(ExceptionEnum.CHAT_ALREADY_COMPLETED);
        }

        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.PATIENT)
                .chatDate(new Date())
                .comment(patientReply)
                .build());

        String nextQuestion = openAiService.generateFollowUpQuestion(patientReply);

        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.CHATBOT)
                .chatDate(new Date())
                .comment(nextQuestion)
                .build());

        return nextQuestion;
    }

    // 그림 수정
    public PaintResponseDto updatePaintById(Long paintId, MultipartFile file, PaintRequestDto dto) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ApiException(ExceptionEnum.FILE_REQUIRED);
        }

        try {
            PaintEntity paint = paintRepository.findById(paintId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));
            if (paint.isFinalized()) {
                throw new ApiException(ExceptionEnum.FINALIZED_PAINT_CANNOT_BE_UPDATED);
            }

            String patientCode = paint.getPatient().getPatientCode();
            String fileUrl = s3Service.uploadFile(file, "paint/" + patientCode, String.valueOf(dto.getCreateDate()));

            paint.setFileUrl(fileUrl);
            paint.setTitle(dto.getTitle());
            paint.setUpdateDate(new Date());

            paintRepository.save(paint);

            return new PaintResponseDto(
                    paint.getPaintId(),
                    paint.getFileUrl(),
                    paint.getCreateDate(),
                    paint.getUpdateDate(),
                    paint.getPatient() != null ? paint.getPatient().getPatientCode() : null,
                    paint.getTitle(),
                    paint.isChatCompleted()
            );

        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 그림 삭제
    public void deletePaint(Long id) {
        PaintEntity paint = paintRepository.findById(id)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

        String fileUrl = paint.getFileUrl();
        s3Service.deleteFile(fileUrl);

        paintRepository.deleteById(id);
    }

    // 대화 완료
    public void completeChat(Long paintId) {
        PaintEntity paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

        paint.setChatCompleted(true);
        paintRepository.save(paint);
    }

}
