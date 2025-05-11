package com.example.blog.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String patientCode;

    private String patientHospital;

    private String memberType;
    @OneToOne
    @JoinColumn(name = "member_id")
    private MemberEntity member;

    @OneToOne
    @JoinColumn(name = "medic_id")
    private MedicalEntity medical;
}
