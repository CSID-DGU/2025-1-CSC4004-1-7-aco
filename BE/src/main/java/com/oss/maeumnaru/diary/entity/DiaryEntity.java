package com.oss.maeumnaru.diary.entity;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.entity.MemberEntity;
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
    @JoinColumn(name = "member_id")  // 외래 키 설정
    private MemberEntity member;  // member 테이블의 id를 참조하는 외래 키
}