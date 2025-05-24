package com.oss.maeumnaru.user.repository;

import com.oss.maeumnaru.user.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, Long> {

    // 이메일로 멤버 찾기
    Optional<MemberEntity> findByEmail(String email);

    // 멤버 ID로 멤버 찾기
    Optional<MemberEntity> findByMemberId(Long memberId);
}