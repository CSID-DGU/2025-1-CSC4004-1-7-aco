package com.oss.maeumnaru.medical.service;

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
    public List<MedicalResponseDto> getPatientsByDoctor(String licenseNumber) {
        DoctorEntity doctor = doctorRepository.findById(licenseNumber)
                .orElseThrow(() -> new IllegalArgumentException("의사를 찾을 수 없습니다."));

        return medicalRepository.findByDoctor(doctor).stream()
                .map(medical -> {
                    PatientEntity patient = medical.getPatient();
                    return MedicalResponseDto.builder()
                            .name(patient.getMember().getName())
                            .birthDate(patient.getMember().getBirthDate())
                            .patientCode(patient.getPatientCode())
                            .build();
                })
                .toList();
    }


    // 환자 추가 (중복 방지 로직 추가)
    public MedicalEntity addPatientToDoctor(String licenseNumber, String patientCode) {
        DoctorEntity doctor = doctorRepository.findById(licenseNumber)
                .orElseThrow(() -> new IllegalArgumentException("의사를 찾을 수 없습니다."));
        PatientEntity patient = patientRepository.findById(patientCode)
                .orElseThrow(() -> new IllegalArgumentException("환자를 찾을 수 없습니다."));

        // 중복 방지 로직: 이미 등록된 환자인지 확인
        medicalRepository.findByPatient(patient).ifPresent(m -> {
            throw new IllegalStateException("해당 환자는 이미 다른 의사에게 배정되어 있습니다.");
        });

        MedicalEntity medical = MedicalEntity.builder()
                .doctor(doctor)
                .patient(patient)
                .firstTreat(new Date())
                .recentTreat(new Date())
                .build();

        return medicalRepository.save(medical);
    }
    // 환자 상세 페이지
    public PatientResponseDto getPatientDetail(String patientCode) {
        PatientEntity patient = patientRepository.findById(patientCode)
                .orElseThrow(() -> new IllegalArgumentException("해당 환자를 찾을 수 없습니다."));

        MemberEntity member = patient.getMember();

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

    public void removePatient(Long medicId) {
        medicalRepository.deleteById(medicId);
    }
}