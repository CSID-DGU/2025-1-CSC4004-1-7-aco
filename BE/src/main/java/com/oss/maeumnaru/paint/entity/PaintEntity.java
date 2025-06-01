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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaintEntity {

    @Id
    @Setter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paintId;

    @Setter
    private String fileUrl;

    @Setter
    @Temporal(TemporalType.DATE)
    private String createDate;

    @Setter
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateDate;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_code")
    private PatientEntity patient;

    @Setter
    @OneToMany(mappedBy = "paint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatEntity> chats = new ArrayList<>();

    @Setter
    @Column(nullable = false)
    private String title;

    @Setter
    private boolean finalized;

    @Column(nullable = false)
    private boolean chatCompleted = false;

    public void setChatCompleted(boolean chatCompleted) {
        this.chatCompleted = chatCompleted;
    }

}