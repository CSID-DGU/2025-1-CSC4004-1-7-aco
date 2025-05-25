package com.oss.maeumnaru.meditation.controller;

import com.oss.maeumnaru.meditation.dto.meditationRequestDto;
import com.oss.maeumnaru.meditation.dto.meditationResponseDto;
import com.oss.maeumnaru.meditation.entity.MeditationEntity;
import com.oss.maeumnaru.meditation.service.MeditationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        MeditationEntity entity = meditationService.getMeditationById(id);  // 예외 발생 시 GlobalExceptionHandler에서 처리됨
        return ResponseEntity.ok(meditationResponseDto.fromEntity(entity));
    }

    // 저장
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<meditationResponseDto> saveMeditation(@RequestBody meditationRequestDto dto) {
        MeditationEntity entity = MeditationEntity.builder()
                .meditationTitle(dto.getMeditationTitle())
                .durationTime(dto.getDurationTime())
                .filePath(dto.getFilePath())
                .build();

        MeditationEntity saved = meditationService.saveMeditation(entity); // 내부에서 예외 발생 가능

        return ResponseEntity.ok(meditationResponseDto.fromEntity(saved));
    }

    // 수정
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<meditationResponseDto> updateMeditation(
            @PathVariable Long id,
            @RequestBody meditationRequestDto dto) {

        MeditationEntity updated = meditationService.updateMeditation(
                id,
                MeditationEntity.builder()
                        .meditationTitle(dto.getMeditationTitle())
                        .durationTime(dto.getDurationTime())
                        .filePath(dto.getFilePath())
                        .build()
        );

        return ResponseEntity.ok(meditationResponseDto.fromEntity(updated));
    }

    //삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMeditation(@PathVariable Long id) {
        meditationService.deleteMeditation(id);
        return ResponseEntity.noContent().build();
    }
}
