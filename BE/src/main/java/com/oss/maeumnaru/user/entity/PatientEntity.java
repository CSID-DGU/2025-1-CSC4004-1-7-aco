package com.oss.maeumnaru.user.entity;

import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.medical.entity.MedicalEntity;

@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEntity {

    @Id
    private String patientCode; // 직접 받는 값

    private String patientHospital;
    private String memberType;

    @OneToOne
    @JoinColumn(name = "member_id", nullable = false)
    private MemberEntity member;

    @OneToOne
    @JoinColumn(name = "medic_id")
    private MedicalEntity medical;
}