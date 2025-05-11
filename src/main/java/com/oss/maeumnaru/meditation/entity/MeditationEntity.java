package com.example.blog.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meditation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeditationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meditationId;

    private String meditationTitle;

    private Long durationTime;

    private String filePath;
}
