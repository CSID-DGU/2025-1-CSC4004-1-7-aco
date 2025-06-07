package com.oss.maeumnaru.diary.dto;

import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmotionResponseDto {
    private Long diaryAnalysisId;
    private String createDate;
    private Float emotionRate;
}
