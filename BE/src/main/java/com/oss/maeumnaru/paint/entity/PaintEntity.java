package com.oss.maeumnaru.paint.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
@Entity
@Table(name = "paint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paintId;

    private String fileUrl;

    @Enumerated(EnumType.STRING)
    private ChatEntity.WriterType writerType;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updateDate;

    private Long patientCode;

}
