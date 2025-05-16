// DiaryRepository.java
package com.oss.maeumnaru.diary.repository;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntity, Long> {
    List<DiaryEntity> findByMember_MemberId(Long memberId);
    List<DiaryEntity> findByMember_MemberIdAndCreateDateBetween(Long memberId, Date startDate, Date endDate);
}
