// DiaryAnalysisRequest.java
package com.oss.maeumnaru.diary.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryAnalysisRequest {
    private Long memberId;
    private String baseDate; // "2025-05-01"
}
