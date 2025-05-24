package com.oss.maeumnaru.medical.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class MedicalResponseDto {
    private String name;
    private Date birthDate;
    private String patientCode;
}
