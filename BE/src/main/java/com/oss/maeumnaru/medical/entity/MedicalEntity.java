package com.example.blog.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "medical")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long medicId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_code")
    private PatientEntity patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_number")
    private DoctorEntity doctor;

    @Temporal(TemporalType.TIMESTAMP)
    private Date firstTreat;

    @Temporal(TemporalType.TIMESTAMP)
    private Date recentTreat;
}
