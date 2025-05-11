package com.example.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface MeditationRepository extends JpaRepository<MeditationEntity, Long> {

}