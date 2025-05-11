package com.example.blog.Entity;

import jakarta.persistence.*;
import lombok.*;

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

    private int paintId;
    private String comment;

    public enum WriterType {
        CHATBOT, PATIENT
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paintId")
    private PaintEntity paint;
}
