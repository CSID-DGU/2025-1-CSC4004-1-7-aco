// DiaryAnalysisRequest.java
package com.oss.maeumnaru.diary.dto;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryAnalysisRequestDto {

    private long emotionRate;

    private long mealCount;

    private LocalTime wakeUpTime;

    private boolean wentOutside;

}