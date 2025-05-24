package com.oss.maeumnaru.paint.service;

import com.oss.maeumnaru.paint.entity.ChatEntity;
import java.util.Random;
import com.oss.maeumnaru.paint.repository.ChatRepository;
import java.util.Date;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.oss.maeumnaru.paint.dto.PaintRequestDto;
import com.oss.maeumnaru.global.s3.S3Uploader;
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
    private final ChatRepository chatRepository;
    private final OpenAiService openAiService;
    //private final S3Uploader s3Uploader;


    // ID에 해당하는 그림 하나 조회 / 존재하지 않을 수 있으므로 Optional로
    public Optional<PaintEntity> getPaintById(Long id) {
        return paintRepository.findById(id);
    }

    // 그림 임시 저장
    public PaintEntity savePaintDraft(MultipartFile file, PaintRequestDto dto) throws IOException {
        //String fileUrl = s3Uploader.uploadImage(file, "paint");
        String fileUrl = "https://dummy-s3-url.com/" + file.getOriginalFilename();

        PaintEntity paint = PaintEntity.builder()
                .fileUrl(fileUrl)
                .writerType(ChatEntity.WriterType.PATIENT)
                .patientCode(dto.getPatientCode())
                .title(dto.getTitle())
                .createDate(new Date())
                .updateDate(new Date())
                .build();

        return paintRepository.save(paint);
    }

    //그림 최종 저장
    public void finalizePaint(Long id, MultipartFile file, PaintRequestDto dto) throws IOException {
        PaintEntity paint = paintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("그림을 찾을 수 없습니다."));

        boolean hasChat = chatRepository.findByPaint_PaintIdOrderByChatDateAsc(id).size() > 0;
        if (hasChat) throw new IllegalStateException("이미 대화가 시작된 그림입니다.");

        //String fileUrl = s3Uploader.uploadImage(file, "paint");
        String fileUrl = null;//추후 삭제!!

        paint.setFileUrl(fileUrl);
        paint.setWriterType(ChatEntity.WriterType.PATIENT);
        paint.setPatientCode(dto.getPatientCode());
        paint.setTitle(dto.getTitle());
        paint.setUpdateDate(new Date());

        paintRepository.save(paint);
        startChatWithPaint(paint);
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
                .orElseThrow(() -> new RuntimeException("그림을 찾을 수 없습니다."));

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
    public PaintEntity updatePaint(Long id, PaintEntity updatedPaint) {
        boolean hasChat = chatRepository.findByPaint_PaintIdOrderByChatDateAsc(id).size() > 0;
        if (hasChat) throw new IllegalStateException("이미 대화가 시작된 그림은 수정할 수 없습니다.");

        return paintRepository.findById(id)
                .map(paint -> {
                    paint.setFileUrl(updatedPaint.getFileUrl());
                    paint.setWriterType(updatedPaint.getWriterType());
                    paint.setUpdateDate(updatedPaint.getUpdateDate());
                    paint.setPatientCode(updatedPaint.getPatientCode());
                    return paintRepository.save(paint);
                })
                .orElseThrow(() -> new RuntimeException("그림을 찾을 수 없습니다."));
    }


    // 그림 삭제 - ID를 기반으로 그림을 삭제
    public void deletePaint(Long id) {
        paintRepository.deleteById(id);
    }

    //대화 완료 저장
    public void saveCompleteChat(Long paintId, List<ChatRequestDto> chatList) {
        PaintEntity paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new RuntimeException("그림을 찾을 수 없습니다."));

        for (ChatRequestDto dto : chatList) {
            // GPT 질문은 무조건 저장
            chatRepository.save(ChatEntity.builder()
                    .paint(paint)
                    .writerType(ChatEntity.WriterType.CHATBOT)
                    .chatDate(new Date())
                    .comment(dto.getChatbotComment())
                    .build());

            // 환자 응답이 null 또는 빈 값이 아니면 저장
            if (dto.getPatientComment() != null && !dto.getPatientComment().isBlank()) {
                chatRepository.save(ChatEntity.builder()
                        .paint(paint)
                        .writerType(ChatEntity.WriterType.PATIENT)
                        .chatDate(new Date())
                        .comment(dto.getPatientComment())
                        .build());
            }
        }
    }




}