package com.oss.maeumnaru.medical.repository;

import com.oss.maeumnaru.medical.entity.MedicalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRepository extends JpaRepository<MedicalEntity, Long> {

}