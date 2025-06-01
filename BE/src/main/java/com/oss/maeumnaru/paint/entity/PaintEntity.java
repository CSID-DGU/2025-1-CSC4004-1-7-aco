package com.oss.maeumnaru.paint.entity;

import com.oss.maeumnaru.user.entity.PatientEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "paint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paintId;

    private String fileUrl;

    @Temporal(TemporalType.DATE)
    private String createDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updateDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_code")
    private PatientEntity patient;

    @OneToMany(mappedBy = "paint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatEntity> chats = new ArrayList<>();

    @Column(nullable = false)
    private String title;

    private boolean finalized;

    @Column(nullable = false)
    private boolean chatCompleted = false;


}