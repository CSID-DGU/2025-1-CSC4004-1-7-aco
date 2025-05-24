package com.oss.maeumnaru.meditation.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class meditationRequestDto {
    private String meditationTitle;
    private Long durationTime;
    private String filePath;
}
