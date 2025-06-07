package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.medical.repository.MedicalRepository;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.repository.DoctorRepository;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final PatientRepository patientRepository;
    private final S3Service s3Service;

    @Transactional
    public DiaryResponseDto createDiary(String patientCode, DiaryRequestDto request, MultipartFile file) {
        try {
            PatientEntity patient = patientRepository.findByPatientCode(patientCode)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));
            String dateStr = request.getCreateDate();
            String contentPath = s3Service.uploadFile(file, patientCode + "/diary", dateStr);

            DiaryEntity diary = DiaryEntity.builder()
                    .contentPath(contentPath)
                    .title(request.getTitle())
                    .createDate(request.getCreateDate())
                    .updateDate(new Date())
                    .patient(patient)
                    .build();

            DiaryEntity saved = diaryRepository.save(diary);
            return DiaryResponseDto.fromEntity(saved);

        } catch (IOException e) {
            log.error("File upload error", e);
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (DataAccessException e) {
            log.error("Database error occurred", e);
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            log.error("Server error occurred", e);
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    public DiaryResponseDto updateDiary(String patientCode, Long diaryId, DiaryRequestDto request, MultipartFile file) {
        try {
            DiaryEntity existingDiary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));

            if (!existingDiary.getPatient().getPatientCode().equals(patientCode)) {
                throw new ApiException(ExceptionEnum.FORBIDDEN_ACCESS);
            }
            String dateStr = request.getCreateDate();
            String contentPath = s3Service.uploadFile(file, patientCode + "/diary", dateStr);


            existingDiary.setContentPath(contentPath);
            existingDiary.setTitle(request.getTitle());
            existingDiary.setUpdateDate(new Date());

            return DiaryResponseDto.fromEntity(diaryRepository.save(existingDiary));

        } catch (IOException e) {
            log.error("File upload error", e);
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (DataAccessException e) {
            log.error("Database error occurred", e);
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            log.error("Server error occurred", e);
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    @Transactional
    public void deleteDiary(String patientCode, Long diaryId) {
        try {
            DiaryEntity existingDiary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));

            if (!existingDiary.getPatient().getPatientCode().equals(patientCode)) {
                throw new ApiException(ExceptionEnum.FORBIDDEN_ACCESS);
            }

            s3Service.deleteFile(existingDiary.getContentPath());
            diaryRepository.delete(existingDiary);

        } catch (DataAccessException e) {
            log.error("Database error occurred", e);
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            log.error("Server error occurred", e);
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    public Optional<DiaryResponseDto> getDiaryByPatientCodeAndDate(String patientCode, String date) {
        try {

            Optional<DiaryEntity> diary = diaryRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date);
            return diary.map(DiaryResponseDto::fromEntity);
        } catch (DataAccessException e) {
            log.error("Database error occurred", e);
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            log.error("Server error occurred", e);
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
