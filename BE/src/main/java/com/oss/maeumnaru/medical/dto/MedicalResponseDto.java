package com.oss.maeumnaru.medical.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class MedicalResponseDto {

    private String patientCode;
    private String patientName;
    private String patientBirthDate;

    private String doctorName;
    private String doctorLicenseNumber;

    private Date firstTreat;
    private Date recentTreat;
}
