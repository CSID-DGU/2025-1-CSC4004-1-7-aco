package com.oss.maeumnaru.paint.repository;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaintRepository extends JpaRepository<PaintEntity, Long> {

}