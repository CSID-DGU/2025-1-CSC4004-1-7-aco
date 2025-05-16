// DiaryAnalysisEntity.java
package com.oss.maeumnaru.diary.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.Date;

@Entity
@Table(name = "diary_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryAnalysisEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long diaryAnalysisId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date analysisCreatedDate;

    @Temporal(TemporalType.DATE)
    private Date analysisTargetDate;

    private long emotionRate;

    private long mealCount;

    private LocalTime wakeUpTime;

    private boolean wentOutside;

    private String resultFilePath;

    private String resultFileName;

    @Lob
    private String diarySourceIdsJson; // [1,2,3] 형식으로 저장

    @ManyToOne
    @JoinColumn(name = "member_id")
    private com.oss.maeumnaru.user.entity.MemberEntity member;
}