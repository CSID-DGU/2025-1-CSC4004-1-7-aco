package com.oss.maeumnaru.paint.controller;

import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.paint.service.PaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paint")
@RequiredArgsConstructor
public class PaintController {

    private final PaintService paintService;

    // 전체 그림 조회
    @GetMapping
    public ResponseEntity<List<PaintEntity>> getAllPaints() {
        return ResponseEntity.ok(paintService.getAllPaints());
    }

    // ID로 그림 조회
    @GetMapping("/{id}")
    public ResponseEntity<PaintEntity> getPaintById(@PathVariable Long id) {
        return paintService.getPaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 그림 저장
    @PostMapping
    public ResponseEntity<PaintEntity> savePaint(@RequestBody PaintEntity paint) {
        return ResponseEntity.ok(paintService.savePaint(paint));
    }

    // 그림 수정
    @PutMapping("/{id}")
    public ResponseEntity<PaintEntity> updatePaint(@PathVariable Long id, @RequestBody PaintEntity updatedPaint) {
        try {
            return ResponseEntity.ok(paintService.updatePaint(id, updatedPaint));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 그림 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaint(@PathVariable Long id) {
        paintService.deletePaint(id);
        return ResponseEntity.noContent().build();
    }
}
