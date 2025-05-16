
// DiaryRequest.java
package com.oss.maeumnaru.diary.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryRequest {
    private String content;
    private String patientCode;
    private Long memberId;
    private Long paintId;
}
