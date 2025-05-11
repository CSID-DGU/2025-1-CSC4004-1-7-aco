package com.example.blog.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "diary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiaryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long diaryId;

    @Lob
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updateDate;

    private String patientCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patientCode")
    private PatientEntity patient;

    @OneToOne
    @JoinColumn(name = "member_id")  // 외래 키 설정
    private MemberEntity member;  // member 테이블의 id를 참조하는 외래 키
}