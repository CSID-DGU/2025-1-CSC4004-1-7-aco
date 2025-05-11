package com.example.blog.Repository;

import com.example.blog.Entity.MedicalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRepository extends JpaRepository<MedicalEntity, Long> {

}