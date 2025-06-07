package com.oss.maeumnaru.paint.service;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.paint.dto.PaintResponseDto;
import com.oss.maeumnaru.paint.entity.ChatEntity;
import java.util.Random;
import com.oss.maeumnaru.paint.repository.ChatRepository;
import java.util.Date;
import java.time.LocalDate;

import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.repository.PatientRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.oss.maeumnaru.paint.dto.PaintRequestDto;
import com.oss.maeumnaru.paint.dto.ChatRequestDto;

import com.oss.maeumnaru.paint.entity.PaintEntity; //DB 매핑되는 그림 엔티티 클래스
import com.oss.maeumnaru.paint.repository.PaintRepository; //DB 접근을 담당하는 리포지토리 인터페이스
import lombok.RequiredArgsConstructor; //final 필드를 자동으로 생성자에 주입하도록 설정
import org.springframework.stereotype.Service; //이 클래스가 서비스 계층임을 나타내는 Spring 애너테이션

//Java 컬렉션과 null 처리용 객체
import java.util.List;
import java.util.Optional;


@Service //이 클래스는 Spring에서 관리되는 서비스 클래스임 의미
@RequiredArgsConstructor //final 필드에 대한 생성자를 자동 생성
public class PaintService {

    //의존성 주입 대상인 paintRepository를 선언, DB 작업을 위한 인터페이스임
    private final PaintRepository paintRepository;
    private final PatientRepository patientRepository;
    private final ChatRepository chatRepository;
    private final OpenAiService openAiService;
    private final S3Service s3Service;

    // ID에 해당하는 그림 하나 조회 / 존재하지 않을 수 있으므로 Optional로
    public Optional<PaintResponseDto> findByPatient_PatientCodeAndCreateDate(String patientCode, String date) {
        Optional<PaintEntity> paintOpt = paintRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date);

        return paintOpt.map(PaintResponseDto::fromEntity);
    }


    public PaintEntity getPaintEntityById(Long paintId) {
        return paintRepository.findById(paintId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));
    }


    public PaintResponseDto savePaintDraft(String patientCode, MultipartFile file, PaintRequestDto dto) throws IOException {
        try {
            // S3에 파일 업로드

            String fileUrl = s3Service.uploadFile(file, patientCode + "/paint", String.valueOf(dto.getCreateDate()));

            PatientEntity patientEntity = patientRepository.findByPatientCode(patientCode)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND)); // PaintEntity 객체 생성

            PaintEntity paint = PaintEntity.builder()
                    .fileUrl(fileUrl)
                    .patient(patientEntity)
                    .title(dto.getTitle())
                    .createDate(dto.getCreateDate())
                    .updateDate(new Date())
                    .build();

            System.out.println("[DEBUG] savePaintDraft() 진입");

            // 그림 임시 저장
            PaintEntity savedPaint = paintRepository.save(paint);

            System.out.println("[DEBUG] chatCompleted in savedPaint = " + savedPaint.isChatCompleted());

            // 저장된 그림을 PaintResponseDto로 변환하여 반환
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
            // 파일 업로드 중 오류가 발생하면 예외 처리
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            // 그 외 예기치 않은 예외 처리
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    public PaintResponseDto finalizePaint(String patientCode, MultipartFile file, PaintRequestDto dto) throws IOException {
        try {
            // 사용자 요청의 날짜를 기준으로 그림을 찾기
            String date = dto.getCreateDate();  // PaintRequestDto에 날짜가 포함되어 있다고 가정
            PatientEntity patientEntity = patientRepository.findByPatientCode(patientCode)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND)); // PaintEntity 객체 생성

            // 환자 코드와 날짜로 그림 조회
            PaintEntity paint = paintRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

            // 대화가 이미 시작된 그림인지 확인
            boolean hasChat = !chatRepository.findByPaint_PaintIdOrderByChatDateAsc(paint.getPaintId()).isEmpty();
            if (hasChat) {
                throw new ApiException(ExceptionEnum.CHAT_ALREADY_START);
            }

            // S3에 파일 업로드
            String fileUrl = s3Service.uploadFile(file, patientCode + "/paint", String.valueOf(dto.getCreateDate()));

            // 그림 정보 업데이트
            paint.setFileUrl(fileUrl);
            paint.setPatient(patientEntity);  // 환자 코드 설정
            paint.setTitle(dto.getTitle());
            paint.setUpdateDate(new Date());

            // 그림 저장
            paintRepository.save(paint);

            // 대화 시작
            startChatWithPaint(paint);

            // PaintEntity를 PaintResponseDto로 변환하여 반환
            return new PaintResponseDto(
                    paint.getPaintId(),
                    paint.getFileUrl(),
                    paint.getCreateDate(),
                    paint.getUpdateDate(),
                    paint.getPatient() != null ? paint.getPatient().getPatientCode() : null,
                    paint.getTitle(),
                    paint.isChatCompleted()
            );

        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }


    // 대화 시작 질문
    private static final List<String> PREDEFINED_QUESTIONS = List.of(
            "이 그림을 그릴 때 어떤 감정이었나요?",
            "이 그림은 무엇을 표현한 건가요?",
            "이 그림은 어떤 이야기를 들려주는 것 같나요?",
            "이 그림 속 인물이나 사물의 감정은 어떤가요?",
            "이 그림을 보면 어떤 기억이나 감정이 떠오르나요?"
    );

    //
    private void startChatWithPaint(PaintEntity paint) {
        // 랜덤 질문
        String question = PREDEFINED_QUESTIONS.get(new Random().nextInt(PREDEFINED_QUESTIONS.size()));

        // GPT가 사용자에게 묻는 형태로 저장
        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.CHATBOT) // GPT가 질문자
                .chatDate(new Date())
                .comment(question) // 질문 저장
                .build());
    }

    public String saveReplyAndGetNextQuestion(Long paintId, String patientReply) {
        PaintEntity paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

        if (paint.isChatCompleted()) {
            throw new ApiException(ExceptionEnum.CHAT_ALREADY_COMPLETED);
        }

        // 1. 환자 응답 저장
        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.PATIENT)
                .chatDate(new Date())
                .comment(patientReply)
                .build());

        // 2. GPT 질문 생성
        String nextQuestion = openAiService.generateFollowUpQuestion(patientReply);

        // 3. GPT 질문 저장
        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.CHATBOT)
                .chatDate(new Date())
                .comment(nextQuestion)
                .build());

        return nextQuestion;
    }

    // 그림 수정 - 특정 ID에 해당하는 그림을 수정하는 메서드
    public PaintResponseDto updatePaintById(Long paintId, MultipartFile file, PaintRequestDto dto) throws IOException {
        try {
            // paintId로 그림 조회
            PaintEntity paint = paintRepository.findById(paintId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));
            if (paint.isFinalized()) {
                throw new ApiException(ExceptionEnum.FINALIZED_PAINT_CANNOT_BE_UPDATED);
            }
            String patientCode = paint.getPatient().getPatientCode();

            // S3에 파일 업로드
            String fileUrl = s3Service.uploadFile(file, "paint/" + patientCode, String.valueOf(dto.getCreateDate()));

            // 그림 정보 업데이트
            paint.setFileUrl(fileUrl);          // 파일 URL 수정
            paint.setTitle(dto.getTitle());     // 제목 수정
            paint.setUpdateDate(new Date());    // 수정 날짜 업데이트

            // 그림 저장
            paintRepository.save(paint);

            // PaintEntity를 PaintResponseDto로 변환하여 반환
            return new PaintResponseDto(
                    paint.getPaintId(),
                    paint.getFileUrl(),
                    paint.getCreateDate(),
                    paint.getUpdateDate(),
                    paint.getPatient() != null ? paint.getPatient().getPatientCode() : null,
                    paint.getTitle(),
                    paint.isChatCompleted()
            );

        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }


    public void deletePaint(Long id) {
        // 1. 먼저 DB에서 그림 엔티티 조회
        PaintEntity paint = paintRepository.findById(id)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

        // 2. S3에서 파일 삭제 (fileUrl에서 파일 키 추출 필요)
        String fileUrl = paint.getFileUrl();
        s3Service.deleteFile(fileUrl);
        // 3. DB에서 그림 삭제
        paintRepository.deleteById(id);
    }

    //대화 완료 저장
    public void completeChat(Long paintId) {
        PaintEntity paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PAINT_NOT_FOUND));

        paint.setChatCompleted(true);
        paintRepository.save(paint);

    }

}
