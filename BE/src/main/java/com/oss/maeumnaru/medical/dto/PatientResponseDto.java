package com.oss.maeumnaru.medical.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class PatientResponseDto {
    private String name;
    private Date birthDate;
    private String gender;
    private String email;
    private String phone;
    private String patientCode;
    private String hospital;
}
