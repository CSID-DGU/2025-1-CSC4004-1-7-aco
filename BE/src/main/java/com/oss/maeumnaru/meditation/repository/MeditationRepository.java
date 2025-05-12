package com.oss.maeumnaru.meditation.repository;

import com.oss.maeumnaru.meditation.entity.MeditationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeditationRepository extends JpaRepository<MeditationEntity, Long> {

}