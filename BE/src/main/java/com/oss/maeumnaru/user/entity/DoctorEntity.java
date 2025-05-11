package com.example.blog.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String licenseNumber;

    private String hospital;

    private String certificationPath;
    @OneToOne
    @JoinColumn(name = "member_id")  // 외래 키 설정
    private MemberEntity member;  // member 테이블의 id를 참조하는 외래 키
}

