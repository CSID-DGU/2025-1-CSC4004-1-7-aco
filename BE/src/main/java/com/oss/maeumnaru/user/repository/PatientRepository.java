package com.oss.maeumnaru.user.repository;

import com.oss.maeumnaru.user.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<MemberEntity, Long> {

}