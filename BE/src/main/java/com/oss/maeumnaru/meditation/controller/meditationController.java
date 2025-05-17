package com.oss.maeumnaru.meditation.controller;

import com.oss.maeumnaru.meditation.dto.meditationRequestDto;
import com.oss.maeumnaru.meditation.dto.meditationResponseDto;
import com.oss.maeumnaru.meditation.entity.MeditationEntity;
import com.oss.maeumnaru.meditation.service.MeditationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meditation")
@RequiredArgsConstructor
public class meditationController {

    private final MeditationService meditationService;

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<meditationResponseDto>> getAllMeditations() {
        List<meditationResponseDto> result = meditationService.getAllMeditations()
                .stream()
                .map(meditationResponseDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<meditationResponseDto> getMeditationById(@PathVariable Long id) {
        return meditationService.getMeditationById(id)
                .map(meditationResponseDto::fromEntity)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 저장
    @PostMapping
    public ResponseEntity<meditationResponseDto> saveMeditation(@RequestBody meditationRequestDto dto) {
        MeditationEntity saved = meditationService.saveMeditation(
                MeditationEntity.builder()
                        .meditationTitle(dto.getMeditationTitle())
                        .durationTime(dto.getDurationTime())
                        .filePath(dto.getFilePath())
                        .build()
        );
        return ResponseEntity.ok(meditationResponseDto.fromEntity(saved));
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<meditationResponseDto> updateMeditation(@PathVariable Long id,
                                                                  @RequestBody meditationRequestDto dto) {
        MeditationEntity updated = meditationService.updateMeditation(id,
                MeditationEntity.builder()
                        .meditationTitle(dto.getMeditationTitle())
                        .durationTime(dto.getDurationTime())
                        .filePath(dto.getFilePath())
                        .build()
        );
        return ResponseEntity.ok(meditationResponseDto.fromEntity(updated));
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeditation(@PathVariable Long id) {
        meditationService.deleteMeditation(id);
        return ResponseEntity.noContent().build();
    }
}
