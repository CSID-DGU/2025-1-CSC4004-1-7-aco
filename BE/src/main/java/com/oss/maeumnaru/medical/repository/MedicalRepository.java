package com.oss.maeumnaru.medical.repository;

import com.oss.maeumnaru.medical.entity.MedicalEntity;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRepository extends JpaRepository<MedicalEntity, Long> {

    List<MedicalEntity> findByDoctor(DoctorEntity doctor);

    Optional<MedicalEntity> findByPatient(PatientEntity patient);

    boolean existsByDoctorAndPatient_PatientCode(DoctorEntity doctor, String patientCode);
}
