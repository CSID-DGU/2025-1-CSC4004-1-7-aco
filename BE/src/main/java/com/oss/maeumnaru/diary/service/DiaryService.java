package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryRequestDto;
import com.oss.maeumnaru.diary.dto.DiaryResponseDto;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.global.service.S3Service;
import com.oss.maeumnaru.user.entity.PatientEntity;
import com.oss.maeumnaru.user.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
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

    // 환자 코드 조회 내부 메서드
    private String getPatientCodeByMemberId(Long memberId) {
        PatientEntity patient = patientRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원의 환자 정보가 없습니다."));
        return patient.getPatientCode();
    }

    // 일기 생성
    @Transactional
    public DiaryResponseDto createDiary(Long memberId, DiaryRequestDto request, MultipartFile file) throws IOException {
        // 환자 정보 조회
        PatientEntity patient = patientRepository.findByMember_MemberId(memberId)
                .orElseThrow(() -> new IllegalArgumentException("환자 정보가 존재하지 않습니다."));

        // 파일을 S3에 업로드하고 URL을 반환받음
        String contentPath = s3Service.uploadFile(file, "diary/" + patient.getPatientCode());

        // DiaryEntity 생성
        DiaryEntity diary = DiaryEntity.builder()
                .contentPath(contentPath)  // S3 URL을 contentPath로 설정
                .title(request.getTitle())
                .createDate(new Date())
                .updateDate(new Date())
                .patient(patient)
                .build();

        // 일기 저장
        DiaryEntity saved = diaryRepository.save(diary);

        // 저장된 일기를 DTO로 변환하여 반환
        return DiaryResponseDto.fromEntity(saved);
    }

    // 일기 수정
    @Transactional
    public DiaryResponseDto updateDiary(Long diaryId, DiaryRequestDto request, MultipartFile file) throws IOException {
        // 기존 일기 조회
        DiaryEntity existingDiary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다."));

        // 환자 정보 조회
        PatientEntity patient = existingDiary.getPatient();
        String patientCode = patient.getPatientCode();

        // 기존 파일을 삭제하고 새 파일을 S3에 업로드
        s3Service.deleteFile(existingDiary.getContentPath()); // 기존 파일 삭제
        String contentPath = s3Service.uploadFile(file, "diary/" + patientCode); // 새 파일 업로드

        // 일기 내용 수정
        existingDiary.setContentPath(contentPath);  // 새 파일 URL로 업데이트
        existingDiary.setTitle(request.getTitle());
        existingDiary.setUpdateDate(new Date());  // 수정일자는 현재로 설정

        // 수정된 일기 저장
        DiaryEntity updatedDiary = diaryRepository.save(existingDiary);

        // 수정된 일기를 DTO로 변환하여 반환
        return DiaryResponseDto.fromEntity(updatedDiary);
    }

    // 일기 삭제
    @Transactional
    public void deleteDiary(Long diaryId) {
        // 기존 일기 조회
        DiaryEntity existingDiary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다."));

        // S3에서 해당 파일 삭제
        s3Service.deleteFile(existingDiary.getContentPath());

        // 일기 삭제
        diaryRepository.delete(existingDiary);
    }

    // 일기 조회 (diaryId로 조회)
    public Optional<DiaryResponseDto> getDiaryById(Long diaryId) {
        Optional<DiaryEntity> diaryOpt = diaryRepository.findById(diaryId);
        return diaryOpt.map(DiaryResponseDto::fromEntity);
    }

    // 멤버 ID와 날짜로 하루 일기 조회
    public List<DiaryResponseDto> getDiariesByMemberIdAndDate(Long memberId, Date date) {
        String patientCode = getPatientCodeByMemberId(memberId);
        List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDate(patientCode, date);
        return diaries.stream()
                .map(DiaryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 멤버 ID와 날짜 범위로 일기 리스트 조회
    public List<DiaryResponseDto> getDiariesByMemberIdAndDateRange(Long memberId, Date start, Date end) {
        String patientCode = getPatientCodeByMemberId(memberId);
        List<DiaryEntity> diaries = diaryRepository.findByPatient_PatientCodeAndCreateDateBetweenOrderByCreateDateAsc(patientCode, start, end);
        return diaries.stream()
                .map(DiaryResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 멤버 ID로 최근 7일 일기 조회
    public List<DiaryResponseDto> getDiariesByMemberIdForPast7Days(Long memberId, Date baseDate) {
        long MILLIS_IN_DAY = 24 * 60 * 60 * 1000L;
        Date startDate = new Date(baseDate.getTime() - MILLIS_IN_DAY * 6);
        Date endDate = new Date(baseDate.getTime() + MILLIS_IN_DAY - 1);
        return getDiariesByMemberIdAndDateRange(memberId, startDate, endDate);
    }
}
