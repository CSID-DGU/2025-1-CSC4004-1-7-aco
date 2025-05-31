package com.oss.maeumnaru.paint.dto;

import com.oss.maeumnaru.medical.dto.PatientResponseDto;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaintResponseDto {
    private Long paintId;
    private String fileUrl;
    private String createDate;
    private Date updateDate;
    private String patientCode;  // PatientEntity 대신 환자코드만 저장
    private String title;
    public static PaintResponseDto fromEntity(PaintEntity entity) {
        if (entity == null) return null;
        return new PaintResponseDto(
                entity.getPaintId(),
                entity.getFileUrl(),
                entity.getCreateDate().toString(),
                entity.getUpdateDate(),
                entity.getPatient().getPatientCode(),  // PatientEntity 대신 patientCode 사용
                entity.getTitle()
        );
    }
}

