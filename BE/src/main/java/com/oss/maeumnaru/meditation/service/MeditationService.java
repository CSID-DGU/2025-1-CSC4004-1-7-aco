package com.example.blog.Service;

import com.example.blog.Entity.MeditationEntity;
import com.example.blog.Repository.MeditationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeditationService {

    private final MeditationRepository meditationRepository;

    // 명상 전체 조회
    public List<MeditationEntity> getAllMeditations() {
        return meditationRepository.findAll();
    }

    // ID로 명상 하나 조회
    public Optional<MeditationEntity> getMeditationById(Long id) {
        return meditationRepository.findById(id);
    }

    // 명상 저장
    public MeditationEntity saveMeditation(MeditationEntity meditation) {
        return meditationRepository.save(meditation);
    }

    // 명상 수정
    public MeditationEntity updateMeditation(Long id, MeditationEntity updatedMeditation) {
        return meditationRepository.findById(id)
                .map(meditation -> {
                    meditation.setMeditationTitle(updatedMeditation.getMeditationTitle());
                    meditation.setDurationTime(updatedMeditation.getDurationTime());
                    meditation.setFilePath(updatedMeditation.getFilePath());
                    return meditationRepository.save(meditation);
                })
                .orElseThrow(() -> new RuntimeException("Meditation not found"));
    }

    // 명상 삭제
    public void deleteMeditation(Long id) {
        meditationRepository.deleteById(id);
    }
}
