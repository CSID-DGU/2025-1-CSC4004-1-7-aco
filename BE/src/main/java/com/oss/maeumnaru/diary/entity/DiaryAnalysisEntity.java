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

    @Temporal(TemporalType.DATE)
    private Date resultDate;

    private Long emotionRate;

    private long mealCount;

    private LocalTime wakeUpTime;

    private boolean wentOutside;

    @OneToOne(mappedBy = "diaryAnalysis")
    private DiaryEntity diary;


}