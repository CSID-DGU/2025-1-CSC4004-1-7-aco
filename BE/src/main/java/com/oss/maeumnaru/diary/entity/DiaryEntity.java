// DiaryEntity.java
package com.oss.maeumnaru.diary.entity;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.user.entity.MemberEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "diary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long diaryId;

    @Lob
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updateDate;

    private String patientCode;

    @ManyToOne
    @JoinColumn(name = "paint_id")
    private PaintEntity paint;

    @OneToOne
    @JoinColumn(name = "member_id")
    private MemberEntity member;
}