package com.oss.maeumnaru.medical.entity;

import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
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
