package com.oss.maeumnaru.user.dto.request;

import com.oss.maeumnaru.user.entity.MemberEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

public record SignUpRequestDTO(
        @NotBlank String name,
        @NotBlank String loginId,
        @NotBlank String password,
        @NotBlank @Email String email,
        @NotBlank String phone,
        @NotNull @DateTimeFormat(pattern = "yyyy-MM-dd") Date birthDate,
        @NotNull MemberEntity.Gender gender,
        @NotNull MemberEntity.MemberType memberType,
        String hospital,               // 공통: 병원명
        //MultipartFile certificationFile, // 🔹 의사 전용: 면허증 이미지 파일
        String licenseNumber           // 의사 전용: 면허번호
        //String patientCode             // 환자 전용 필드
) {}
