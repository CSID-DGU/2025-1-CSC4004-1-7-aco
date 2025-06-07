package com.oss.maeumnaru.medical.service;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.medical.entity.MedicalEntity;
import com.oss.maeumnaru.medical.repository.MedicalRepository;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.entity.MemberEntity;
import com.oss.maeumnaru.user.repository.DoctorRepository;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.oss.maeumnaru.medical.dto.MedicalResponseDto;
import com.oss.maeumnaru.medical.dto.PatientResponseDto;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalService {

    private final MedicalRepository medicalRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    // 특정 의사의 환자 목록 조회
    public List<MedicalResponseDto> getPatientsByDoctor(Long memberId) {
        System.out.println(">>> getPatientsByDoctor() called");
        DoctorEntity doctor = doctorRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.DOCTOR_NOT_FOUND));

        List<MedicalEntity> medicalEntities = medicalRepository.findByDoctor(doctor);
        System.out.println(">>> medicalEntities.size() = " + medicalEntities.size());

        return medicalEntities.stream()
                .map(medical -> {
                    System.out.println(">>> doctorLicenseNumber = " + medical.getDoctor().getLicenseNumber());
                    PatientEntity patient = medical.getPatient();
                    MemberEntity member = patient.getMember();

                    // birthDate null 체크
                    if (member.getBirthDate() == null) {
                        throw new ApiException(ExceptionEnum.INVALID_INPUT);
                    }

                    return MedicalResponseDto.builder()
                            .patientCode(patient.getPatientCode())
                            .patientName(member.getName())
                            .patientBirthDate(member.getBirthDate().toString())
                            .doctorName(doctor.getMember().getName())
                            .doctorLicenseNumber(doctor.getLicenseNumber())
                            .firstTreat(medical.getFirstTreat())
                            .recentTreat(medical.getRecentTreat())
                            .build();
                })
                .toList();
    }

    // 환자 추가 (중복 방지 로직 추가)
    public MedicalResponseDto addPatientToDoctor(Long memberId, String patientCode) {
        DoctorEntity doctor = doctorRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.DOCTOR_NOT_FOUND));

        PatientEntity patient = patientRepository.findById(patientCode)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

        medicalRepository.findByPatient(patient).ifPresent(m -> {
            throw new ApiException(ExceptionEnum.PATIENT_ALREADY_ASSIGNED);
        });

        MedicalEntity medical = MedicalEntity.builder()
                .doctor(doctor)
                .patient(patient)
                .firstTreat(new Date())
                .recentTreat(new Date())
                .build();

        MedicalEntity saved = medicalRepository.save(medical);

        MemberEntity member = patient.getMember();
        if (member.getBirthDate() == null) {
            throw new ApiException(ExceptionEnum.INVALID_INPUT);
        }

        return MedicalResponseDto.builder()
                .patientCode(patient.getPatientCode())
                .patientName(member.getName())
                .patientBirthDate(member.getBirthDate().toString())
                .doctorName(doctor.getMember().getName())
                .doctorLicenseNumber(doctor.getLicenseNumber())
                .firstTreat(saved.getFirstTreat())
                .recentTreat(saved.getRecentTreat())
                .build();
    }

    // 환자 상세 페이지
    public PatientResponseDto getPatientDetail(String patientCode) {
        PatientEntity patient = patientRepository.findById(patientCode)
                .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

        MemberEntity member = patient.getMember();
        if (member.getBirthDate() == null) {
            throw new ApiException(ExceptionEnum.INVALID_INPUT);
        }

        return PatientResponseDto.builder()
                .name(member.getName())
                .birthDate(member.getBirthDate())
                .email(member.getEmail())
                .phone(member.getPhone())
                .gender(member.getGender().name())
                .patientCode(patient.getPatientCode())
                .hospital(patient.getPatientHospital())
                .build();
    }

    // 환자 삭제 (doctor + patientCode 조합)
    public void removePatient(Long memberId, String patientCode) {
        DoctorEntity doctor = doctorRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new ApiException(ExceptionEnum.DOCTOR_NOT_FOUND));

        MedicalEntity medical = medicalRepository.findByDoctorAndPatient_PatientCode(doctor, patientCode)
                .orElseThrow(() -> new ApiException(ExceptionEnum.MEDICAL_NOT_FOUND));

        medicalRepository.delete(medical);
    }

}
