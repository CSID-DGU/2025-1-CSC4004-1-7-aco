package com.oss.maeumnaru.paint.service;

import com.oss.maeumnaru.paint.entity.PaintEntity; //DB 매핑되는 그림 엔티티 클래스
import com.oss.maeumnaru.paint.repository.PaintRepository; //DB 접근을 담당하는 리포지토리 인터페이스
import lombok.RequiredArgsConstructor; //final 필드를 자동으로 생성자에 주입하도록 설정
import org.springframework.stereotype.Service; //이 클래스가 서비스 계층임을 나타내는 Spring 애너테이션

//Java 컬렉션과 null 처리용 객체
import java.util.List;
import java.util.Optional;


@Service //이 클래스는 Spring에서 관리되는 서비스 클래스임 의미
@RequiredArgsConstructor //final 필드에 대한 생성자를 자동 생성
public class PaintService {

    //의존성 주입 대상인 paintRepository를 선언, DB 작업을 위한 인터페이스임
    private final PaintRepository paintRepository;

    // 전체 그림 조회 - 모든 그림 데이터를 조회하여 리스트로 반환 <제네릭: 무슨 타입의 데이터인지>
    public List<PaintEntity> getAllPaints() {
        return paintRepository.findAll();
    }

    // ID에 해당하는 그림 하나 조회 / 존재하지 않을 수 있으므로 Optional로
    public Optional<PaintEntity> getPaintById(Long id) {
        return paintRepository.findById(id);
    }

    // 그림 저장 - 전달받은 그림 데이터를 데이터베이스에 저장, 저장된 객체를 반환
    public PaintEntity savePaint(PaintEntity paint) {
        return paintRepository.save(paint);
    }

    // 그림 수정 - 특정 ID에 해당하는 그림을 수정하는 메서드
    public PaintEntity updatePaint(Long id, PaintEntity updatedPaint) {
        return paintRepository.findById(id) //ID로 기존 그림을 조회
                .map(paint -> { //존재하는 경우 기존 그림 객체의 필드들을 새로운 값으로 수정
                    paint.setFileUrl(updatedPaint.getFileUrl());
                    paint.setWriterType(updatedPaint.getWriterType());
                    paint.setUpdateDate(updatedPaint.getUpdateDate());
                    paint.setPatientCode(updatedPaint.getPatientCode());
                    return paintRepository.save(paint); //수정된 그림을 저장하고 반환
                })
                .orElseThrow(() -> new RuntimeException("Paint not found")); //해당 ID의 그림이 없으면 예외를 발생
    }

    // 그림 삭제 - ID를 기반으로 그림을 삭제
    public void deletePaint(Long id) {
        paintRepository.deleteById(id);
    }
}
