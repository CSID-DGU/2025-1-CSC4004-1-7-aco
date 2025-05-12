package com.oss.maeumnaru.diary.entity;

import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import java.time.LocalTime;
import java.util.Date;

@Entity
@Table(name = "diaryAnalysis")
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
    private Date diaryReultDate;

    private long emotionRate;

    private long mealCount;

    private LocalTime wakeUpTime;

    private boolean wentOutside;

    @OneToOne
    @JoinColumn(name = "diaryId")
    private DiaryEntity diary;

}
