package com.oss.maeumnaru.meditation.service;

import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.meditation.entity.MeditationEntity;
import com.oss.maeumnaru.meditation.repository.MeditationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MeditationService {

    private final MeditationRepository meditationRepository;
    private final S3Service s3Service;
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
    public MeditationEntity saveMeditation(MeditationEntity meditation, MultipartFile mp3File) {
        try {
            if (mp3File != null && !mp3File.isEmpty()) {

                String mp3Url = s3Service.uploadFile(mp3File, "meditation/mp3", meditation.getMeditationId() + ".mp3");
                meditation.setFilePath(mp3Url);
            }

            return meditationRepository.save(meditation);

        } catch (DataAccessException | IllegalArgumentException e) {
            throw new ApiException(ExceptionEnum.MEDITATION_SAVE_FAILED);
        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }


    // 명상 삭제
    public void deleteMeditation(Long id) {
        MeditationEntity meditation = meditationRepository.findById(id)
                .orElseThrow(() -> new ApiException(ExceptionEnum.MEDITATION_NOT_FOUND));

        // S3에 업로드된 mp3 파일이 있으면 삭제
        if (meditation.getFilePath() != null && !meditation.getFilePath().isEmpty()) {
            // mp3Url에서 S3 키 경로 추출 필요 (예: https://bucket.s3.region.amazonaws.com/dir/filename.mp3)
            s3Service.deleteFile(meditation.getFilePath());
        }
        try {
            meditationRepository.deleteById(id);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.MEDITATION_DELETE_FAILED);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
