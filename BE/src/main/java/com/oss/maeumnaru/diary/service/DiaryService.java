package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.error.exception.ApiException;
import com.oss.maeumnaru.global.error.exception.ExceptionEnum;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.user.entity.PatientEntity;
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
    private final S3Service s3Service;

    private String getPatientCodeByMemberId(Long memberId) {
        try {
            PatientEntity patient = patientRepository.findByMember_MemberId(memberId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));
            return patient.getPatientCode();
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        }
    }

    @Transactional
    public DiaryResponseDto createDiary(Long memberId, DiaryRequestDto request, MultipartFile file) {
        try {
            PatientEntity patient = patientRepository.findByMember_MemberId(memberId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.PATIENT_NOT_FOUND));

            String contentPath = s3Service.uploadFile(file, "diary/" + patient.getPatientCode());

            DiaryEntity diary = DiaryEntity.builder()
                    .contentPath(contentPath)
                    .title(request.getTitle())
                    .createDate(new Date())
                    .updateDate(new Date())
                    .patient(patient)
                    .build();

            DiaryEntity saved = diaryRepository.save(diary);
            return DiaryResponseDto.fromEntity(saved);

        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    @Transactional
    public DiaryResponseDto updateDiary(Long memberId, Long diaryId, DiaryRequestDto request, MultipartFile file) {
        try {
            DiaryEntity existingDiary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));

            if (!existingDiary.getPatient().getMember().getMemberId().equals(memberId)) {
                throw new ApiException(ExceptionEnum.FORBIDDEN_ACCESS);
            }

            String patientCode = existingDiary.getPatient().getPatientCode();

            s3Service.deleteFile(existingDiary.getContentPath());
            String contentPath = s3Service.uploadFile(file, "diary/" + patientCode);

            existingDiary.setContentPath(contentPath);
            existingDiary.setTitle(request.getTitle());
            existingDiary.setUpdateDate(new Date());

            return DiaryResponseDto.fromEntity(diaryRepository.save(existingDiary));

        } catch (IOException e) {
            throw new ApiException(ExceptionEnum.FILE_UPLOAD_FAILED);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    @Transactional
    public void deleteDiary(Long memberId, Long diaryId) {
        try {
            DiaryEntity existingDiary = diaryRepository.findById(diaryId)
                    .orElseThrow(() -> new ApiException(ExceptionEnum.DIARY_NOT_FOUND));

            if (!existingDiary.getPatient().getMember().getMemberId().equals(memberId)) {
                throw new ApiException(ExceptionEnum.FORBIDDEN_ACCESS);
            }

            s3Service.deleteFile(existingDiary.getContentPath());
            diaryRepository.delete(existingDiary);

        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }

    public Optional<DiaryResponseDto> getDiaryById(Long memberId, Long diaryId) {
        try {
            return diaryRepository.findById(diaryId)
                    .filter(diary -> diary.getPatient().getMember().getMemberId().equals(memberId))
                    .map(DiaryResponseDto::fromEntity);
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        }
    }

    public List<DiaryResponseDto> getDiariesByMemberIdAndDate(Long memberId, Date date) {
        try {
            String patientCode = getPatientCodeByMemberId(memberId);
            List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date);
            return diaries.stream()
                    .map(DiaryResponseDto::fromEntity)
                    .collect(Collectors.toList());
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        }
    }

    public List<DiaryResponseDto> getDiariesByMemberIdAndDateRange(Long memberId, Date start, Date end) {
        try {
            String patientCode = getPatientCodeByMemberId(memberId);
            List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDateBetweenOrderByCreateDateAsc(patientCode, start, end);
            return diaries.stream()
                    .map(DiaryResponseDto::fromEntity)
                    .collect(Collectors.toList());
        } catch (DataAccessException e) {
            throw new ApiException(ExceptionEnum.DATABASE_ERROR);
        }
    }

    public List<DiaryResponseDto> getDiariesByMemberIdForPast7Days(Long memberId, Date baseDate) {
        try {
            long MILLIS_IN_DAY = 24 * 60 * 60 * 1000L;
            Date startDate = new Date(baseDate.getTime() - MILLIS_IN_DAY * 6);
            Date endDate = new Date(baseDate.getTime() + MILLIS_IN_DAY - 1);
            return getDiariesByMemberIdAndDateRange(memberId, startDate, endDate);
        } catch (Exception e) {
            throw new ApiException(ExceptionEnum.SERVER_ERROR);
        }
    }
}
