package com.oss.maeumnaru.diary.dto;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryResponseDto {

    private Long diaryId;
    private String contentPath;
    private String title;
    private String createDate;
    private Date updateDate;
    private String patientCode;

    public static DiaryResponseDto fromEntity(DiaryEntity entity) {
        return DiaryResponseDto.builder()
                .diaryId(entity.getDiaryId())
                .contentPath(entity.getContentPath())
                .title(entity.getTitle())
                .createDate(entity.getCreateDate())
                .updateDate(entity.getUpdateDate())
                .patientCode(entity.getPatient() != null ? entity.getPatient().getPatientCode() : null)
                .build();
    }
}
