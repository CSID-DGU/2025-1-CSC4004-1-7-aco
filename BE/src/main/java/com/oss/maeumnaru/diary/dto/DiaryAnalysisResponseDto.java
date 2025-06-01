package com.oss.maeumnaru.diary.dto;

import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import lombok.*;

import java.time.LocalTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryAnalysisResponseDto {

    private Long diaryAnalysisId;
    private Date resultDate;  // 엔티티의 diaryReultDate 오타 수정해서 일치시킴
    private long emotionRate;
    private long mealCount;
    private LocalTime wakeUpTime;
    private boolean wentOutside;
    private String createDate;
    private Boolean analyzed;

    public static DiaryAnalysisResponseDto fromEntity(DiaryAnalysisEntity entity) {
        return DiaryAnalysisResponseDto.builder()
                .diaryAnalysisId(entity.getDiaryAnalysisId())
                .resultDate(entity.getResultDate())  // 오타 주의!
                .emotionRate(entity.getEmotionRate())
                .mealCount(entity.getMealCount())
                .wakeUpTime(entity.getWakeUpTime())
                .wentOutside(entity.isWentOutside())
                .createDate(entity.getCreateDate())
                .analyzed(entity.getAnalyzed())
                .build();
    }
}
