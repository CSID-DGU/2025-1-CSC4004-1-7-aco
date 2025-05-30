package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.medical.repository.MedicalRepository;
import com.oss.maeumnaru.user.entity.DoctorEntity;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.repository.DoctorRepository;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalRepository medicalRepository;
    private final S3Service s3Service;

    // 기존 getPatientCodeByMemberId 삭제 혹은 사용하지 않음

    @Transactional
    public DiaryResponseDto createDiary(String patientCode, DiaryRequestDto request, MultipartFile file) {
        try {
            PatientEntity patient = patientRepository.findByPatientCode(patientCode)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

            String contentPath = s3Service.uploadFile(file, patientCode + "/diary", String.valueOf(request.getCreateDate()) + ".txt");

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
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (DataAccessException e) {
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            e.printStackTrace(); // 로그 추가
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

            String contentPath = s3Service.uploadFile(file, patientCode + "/diary", String.valueOf(existingDiary.getCreateDate()) + ".txt");

            existingDiary.setContentPath(contentPath);
            existingDiary.setTitle(request.getTitle());
            existingDiary.setUpdateDate(new Date());

            return DiaryResponseDto.fromEntity(diaryRepository.save(existingDiary));

        } catch (IOException e) {
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (DataAccessException e) {
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            e.printStackTrace(); // 로그 추가
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
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    public Optional<DiaryResponseDto> getDiaryByPatientCodeAndDate(String patientCode, Date date) {
        try {
            Optional<DiaryEntity> diary = diaryRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date);
            return diary.map(DiaryResponseDto::fromEntity);
        } catch (DataAccessException e) {
            e.printStackTrace(); // 로그 추가
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        }
    }

}

