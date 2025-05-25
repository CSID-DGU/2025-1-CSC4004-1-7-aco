package com.oss.maeumnaru.meditation.dto;

import com.oss.maeumnaru.meditation.entity.MeditationEntity;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class meditationResponseDto {
    private Long meditationId;
    private String meditationTitle;
    private Long durationTime;
    private String filePath;

    public static meditationResponseDto fromEntity(MeditationEntity entity) {
        return meditationResponseDto.builder()
                .meditationId(entity.getMeditationId())
                .meditationTitle(entity.getMeditationTitle())
                .durationTime(entity.getDurationTime())
                .filePath(entity.getFilePath())
                .build();
    }
}
