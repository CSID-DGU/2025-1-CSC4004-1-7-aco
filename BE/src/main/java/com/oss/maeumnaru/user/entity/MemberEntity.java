package com.oss.maeumnaru.user.entity;

import jakarta.persistence.*;
import lombok.*;
import com.oss.maeumnaru.user.entity.DoctorEntity;
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
    private String password;
    private String email;
    private String phone;
    private String membrId;
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
        PATIENT, DOCTOR
    }
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private DoctorEntity doctor;
}

