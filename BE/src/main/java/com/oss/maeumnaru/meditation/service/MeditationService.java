package com.oss.maeumnaru.meditation.service;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.meditation.entity.MeditationEntity;
import com.oss.maeumnaru.meditation.repository.MeditationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeditationService {

    private final MeditationRepository meditationRepository;

    // 명상 전체 조회
    public List<MeditationEntity> getAllMeditations() {
        try {
            return meditationRepository.findAll();
        } catch (DataAccessException | IllegalStateException e) {
            // DB 연결 문제, 잘못된 트랜잭션 등
            throw new ApiException(ExceptionEnum.MEDITATION_RETRIEVAL_FAILED);
        } catch (Exception e) {
            // 그 외 예상치 못한 모든 예외
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
    // ID로 명상 하나 조회
    public MeditationEntity getMeditationById(Long id) {
        try {
            return meditationRepository.findById(id)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.MEDITATION_NOT_FOUND));
        } catch (DataAccessException e) {
            // DB 연결 등 문제
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        } catch (Exception e) {
            // 기타 예기치 못한 예외
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
    // 명상 저장
    public MeditationEntity saveMeditation(MeditationEntity meditation) {
        try {
            return meditationRepository.save(meditation);
        } catch (DataAccessException | IllegalArgumentException e) {
            // 저장 중 DB 문제, 필드 제약 오류 등
            throw new ApiException(ExceptionEnum.MEDITATION_SAVE_FAILED);
        } catch (Exception e) {
            // 그 외 예기치 못한 오류
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 명상 수정
    public MeditationEntity updateMeditation(Long id, MeditationEntity updatedMeditation) {
        MeditationEntity meditation = meditationRepository.findById(id)
                .orElseThrow(() -> new ApiException(ExceptionEnum.MEDITATION_NOT_FOUND));

        try {
            meditation.setMeditationTitle(updatedMeditation.getMeditationTitle());
            meditation.setDurationTime(updatedMeditation.getDurationTime());
            meditation.setFilePath(updatedMeditation.getFilePath());

            return meditationRepository.save(meditation);

        } catch (DataAccessException | IllegalArgumentException e) {
            throw new ApiException(ExceptionEnum.MEDITATION_SAVE_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    // 명상 삭제
    public void deleteMeditation(Long id) {
        // 1. 존재 확인
        if (!meditationRepository.existsById(id)) {
            throw new ApiException(ExceptionEnum.MEDITATION_NOT_FOUND);
        }

        // 2. 삭제 시도
        try {
            meditationRepository.deleteById(id);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.MEDITATION_DELETE_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
