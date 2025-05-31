package com.oss.maeumnaru.medical.repository;

import com.oss.maeumnaru.medical.entity.MedicalEntity;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MedicalRepository extends JpaRepository<MedicalEntity, Long> {

    @Query("SELECT m FROM MedicalEntity m JOIN FETCH m.patient p JOIN FETCH m.doctor d WHERE m.doctor = :doctor")
    List<MedicalEntity> findByDoctor(@Param("doctor") DoctorEntity doctor);

    Optional<MedicalEntity> findByPatient(PatientEntity patient);

    boolean existsByDoctorAndPatient_PatientCode(DoctorEntity doctor, String patientCode);
}
