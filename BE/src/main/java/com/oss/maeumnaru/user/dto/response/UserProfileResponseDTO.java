// UserProfileResponseDTO.java
package com.oss.maeumnaru.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponseDTO {
    private Long memberId;
    private String name;
    private String loginId;
    private String email;
    private String phone;
    private String gender;
    private String memberType;
    private String birthDate;
    private String createDate;
    private String hospital; // doctor or patient 병원명
    private String patientCode;   // 환자코드 (환자일 때만 값 있음)
}
