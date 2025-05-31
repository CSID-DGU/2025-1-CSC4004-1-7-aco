// DiaryEntity.java
package com.oss.maeumnaru.diary.entity;

import com.oss.maeumnaru.user.entity.PatientEntity;
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

    private String contentPath;

    private String title;

    @Temporal(TemporalType.DATE)
    private Date createDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updateDate;

    @ManyToOne
    @JoinColumn(name = "patient_code")
    private PatientEntity patient;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "diary_analysis_id")  // DiaryEntity 테이블에 FK 컬럼
    private DiaryAnalysisEntity diaryAnalysis;


}