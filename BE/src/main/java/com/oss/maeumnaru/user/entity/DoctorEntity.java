package com.oss.maeumnaru.user.entity;

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
    private String licenseNumber;

    private String hospital;
    private String certificationPath;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")  // FK 컬럼
    private MemberEntity member;

}
