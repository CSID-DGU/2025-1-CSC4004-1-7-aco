package com.oss.maeumnaru.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    private String name;

    @Column(unique = true, nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(unique = true, nullable = false)
    private String loginId;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @Temporal(TemporalType.DATE)
    private Date birthDate;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    private MemberType memberType;

    public enum Gender {
        MALE, FEMALE
    }
    public enum MemberType {
        PATIENT, DOCTOR, ADMIN
    }
    @OneToOne(mappedBy = "member_id", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private DoctorEntity doctor;

    @OneToOne(mappedBy = "member_id", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PatientEntity patient;

}