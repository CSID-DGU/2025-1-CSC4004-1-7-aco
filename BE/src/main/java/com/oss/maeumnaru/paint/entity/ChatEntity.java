package com.oss.maeumnaru.paint.entity;

import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import java.util.Date;

@Entity
@Table(name = "chat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date chatDate;

    @Enumerated(EnumType.STRING)
    private WriterType writerType;

    private String comment;

    public enum WriterType {
        CHATBOT, PATIENT
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paintId")
    private PaintEntity paint;
}
