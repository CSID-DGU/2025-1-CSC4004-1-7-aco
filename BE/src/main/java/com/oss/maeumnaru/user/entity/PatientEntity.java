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

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PatientEntity patient;

    @OneToOne
    @JoinColumn(name = "medic_id")
    private MedicalEntity medical;
}
