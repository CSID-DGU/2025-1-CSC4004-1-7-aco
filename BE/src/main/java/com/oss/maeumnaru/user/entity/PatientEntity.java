package com.oss.maeumnaru.user.entity;

import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.medical.entity.MedicalEntity;

import java.util.ArrayList;
import java.util.List;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")  // FK 컬럼
    private MemberEntity member;

    @OneToOne(fetch = FetchType.LAZY, mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private MedicalEntity medical;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaryEntity> diaries = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaintEntity> paints = new ArrayList<>();
}
