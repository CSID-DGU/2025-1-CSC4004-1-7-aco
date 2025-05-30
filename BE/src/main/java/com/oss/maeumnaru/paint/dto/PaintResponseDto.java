package com.oss.maeumnaru.paint.dto;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaintResponseDto {
    private Long paintId;
    private String fileUrl;
    private Date createDate;
    private Date updateDate;
    private String patientCode;
    private String title;
    public static PaintResponseDto fromEntity(PaintEntity paintEntity) {
        PaintResponseDto dto = new PaintResponseDto();
        dto.setPaintId(paintEntity.getPaintId());
        dto.setFileUrl(paintEntity.getFileUrl());
        dto.setPatientCode(paintEntity.getPatientCode());
        dto.setCreateDate(paintEntity.getCreateDate());
        dto.setUpdateDate(paintEntity.getUpdateDate());
        dto.setTitle(paintEntity.getTitle());
        return dto;
    }
}