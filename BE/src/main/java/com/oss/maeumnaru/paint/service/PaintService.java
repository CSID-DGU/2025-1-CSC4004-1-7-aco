package com.oss.maeumnaru.paint.service;

import com.oss.maeumnaru.paint.entity.ChatEntity;
import java.util.Random;
import com.oss.maeumnaru.paint.entity.ChatEntity.WriterType;
import com.oss.maeumnaru.paint.repository.ChatRepository;
import com.oss.maeumnaru.paint.service.OpenAiService;
import java.util.Date;

import com.oss.maeumnaru.paint.entity.PaintEntity; //DB 매핑되는 그림 엔티티 클래스
import com.oss.maeumnaru.paint.repository.PaintRepository; //DB 접근을 담당하는 리포지토리 인터페이스
import lombok.RequiredArgsConstructor; //final 필드를 자동으로 생성자에 주입하도록 설정
import org.springframework.stereotype.Service; //이 클래스가 서비스 계층임을 나타내는 Spring 애너테이션
import com.oss.maeumnaru.global.s3.S3Uploader; // 실제 경로에 맞게 수정
import java.io.IOException;
import java.util.UUID;



//Java 컬렉션과 null 처리용 객체
import java.util.List;
import java.util.Optional;


@Service //이 클래스는 Spring에서 관리되는 서비스 클래스임 의미
@RequiredArgsConstructor //final 필드에 대한 생성자를 자동 생성
public class PaintService {

    //의존성 주입 대상인 paintRepository를 선언, DB 작업을 위한 인터페이스임
    private final PaintRepository paintRepository;
    private final ChatRepository chatRepository;       // ✅ 새로 추가
    private final OpenAiService openAiService;

    private final S3Uploader s3Uploader;


    // ID에 해당하는 그림 하나 조회 / 존재하지 않을 수 있으므로 Optional로
    public Optional<PaintEntity> getPaintById(Long id) {
        return paintRepository.findById(id);
    }

    // 그림 저장 - 전달받은 그림 데이터를 데이터베이스에 저장, 저장된 객체를 반환
    public PaintEntity savePaint(PaintEntity paint) {
        PaintEntity saved = paintRepository.save(paint);

        // 그림 저장 직후 대화 시작
        startChatWithPaint(saved);

        return saved;
    }

    private static final List<String> PREDEFINED_QUESTIONS = List.of(
            "이 그림을 보고 느껴지는 감정은 무엇인가요?",
            "이 그림은 어떤 분위기를 담고 있나요?",
            "이 그림은 어떤 이야기를 들려주는 것 같나요?",
            "이 그림 속 인물이나 사물의 감정은 어떤가요?",
            "이 그림을 보면 어떤 기억이 떠오르나요?"
    );

    private void startChatWithPaint(PaintEntity paint) {
        // ✅ 1. 질문 무작위 선택
        String question = PREDEFINED_QUESTIONS.get(new Random().nextInt(PREDEFINED_QUESTIONS.size()));

        // ✅ 2. GPT가 사용자에게 묻는 형태로 저장
        chatRepository.save(ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.CHATBOT) // GPT가 질문자
                .chatDate(new Date())
                .comment(question) // 질문 자체를 저장
                .build());

        // ✅ 3. GPT가 대답하지 않도록 한다 (응답 없음)
        // 이후 사용자가 답변하면 PATIENT로 새로운 ChatEntity 추가
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

    public ChatEntity saveUserReply(Long paintId, String userReply) throws IOException {
        PaintEntity paint = paintRepository.findById(paintId)
                .orElseThrow(() -> new RuntimeException("해당 그림이 없습니다."));

        String fileName = "reply_" + UUID.randomUUID() + ".txt";
        String fileUrl = s3Uploader.uploadTextAsFile(userReply, fileName, "replies");

        ChatEntity chat = ChatEntity.builder()
                .paint(paint)
                .writerType(ChatEntity.WriterType.PATIENT)
                .chatDate(new Date())
                .comment(fileUrl)  // 실제 답변 내용 대신 URL 저장
                .build();

        return chatRepository.save(chat);
    }

    public List<ChatEntity> getChatsByPaintId(Long paintId) {
        return chatRepository.findByPaint_PaintIdOrderByChatDateAsc(paintId);
    }

    public String summarizeAndSaveChats(Long paintId) throws IOException {
        List<ChatEntity> chats = chatRepository.findByPaint_PaintIdOrderByChatDateAsc(paintId);

        StringBuilder fullDialogue = new StringBuilder();
        for (ChatEntity chat : chats) {
            String prefix = chat.getWriterType() == WriterType.CHATBOT ? "[GPT]" : "[USER]";
            fullDialogue.append(prefix)
                    .append(" ")
                    .append(chat.getComment())
                    .append("\n");
        }

        String prompt = "다음은 사용자와 GPT의 대화입니다:\n" + fullDialogue + "\n이 대화를 간결하게 요약해줘.";
        String summary = openAiService.sendChatPrompt(prompt); // GPT 요약 결과

        String fileName = "summary_" + paintId + "_" + UUID.randomUUID() + ".txt";
        String summaryUrl = s3Uploader.uploadTextAsFile(summary, fileName, "summaries");

        return summaryUrl;
    }




}
