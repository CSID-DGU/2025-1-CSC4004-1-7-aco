package com.oss.maeumnaru.user.entity;

import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.user.entity.MemberEntity;
@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorEntity {

    @Id
    private String licenseNumber;

    private String hospital;

    private String certificationPath;
    @OneToOne
    @JoinColumn(name = "member_id")  // 외래 키 설정
    private MemberEntity member;  // member 테이블의 id를 참조하는 외래 키
}