package com.oss.maeumnaru.diary.service;

import com.oss.maeumnaru.diary.dto.DiaryRequest;
import com.oss.maeumnaru.diary.entity.DiaryEntity;
import com.oss.maeumnaru.diary.entity.DiaryAnalysisEntity;
import com.oss.maeumnaru.diary.repository.DiaryRepository;
import com.oss.maeumnaru.diary.repository.DiaryAnalysisRepository;
import com.oss.maeumnaru.paint.entity.PaintEntity;
import com.oss.maeumnaru.paint.repository.PaintRepository;
import com.oss.maeumnaru.user.entity.MemberEntity;
import com.oss.maeumnaru.user.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final DiaryAnalysisRepository diaryAnalysisRepository;
    private final MemberRepository memberRepository;
    private final PaintRepository paintRepository;

    // 일기 등록
    public DiaryEntity saveDiary(DiaryRequest request, MultipartFile contentFile) {
        MemberEntity member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        PaintEntity paint = paintRepository.findById(request.getPaintId()).orElse(null);

        String s3Url = uploadToS3(contentFile);

        DiaryEntity diary = DiaryEntity.builder()
                .content(s3Url)
                .createDate(new Date())
                .updateDate(new Date())
                .patientCode(request.getPatientCode())
                .member(member)
                .paint(paint)
                .build();

        return diaryRepository.save(diary);
    }

    // 일기 수정
    public DiaryEntity updateDiary(Long diaryId, MultipartFile newFile) {
        DiaryEntity diary = diaryRepository.findById(diaryId)
                .orElseThrow(() -> new IllegalArgumentException("일기를 찾을 수 없습니다."));

        String newUrl = uploadToS3(newFile);
        diary.setContent(newUrl);
        diary.setUpdateDate(new Date());
        return diaryRepository.save(diary);
    }

    // 일기 조회
    public List<DiaryEntity> getDiariesByDate(Long memberId, Date dateStart, Date dateEnd) {
        return diaryRepository.findByMember_MemberIdAndCreateDateBetween(memberId, dateStart, dateEnd);
    }

    // 일기 삭제
    public void deleteDiary(Long diaryId) {
        diaryRepository.deleteById(diaryId);
    }

    // AI 분석 저장
    public DiaryAnalysisEntity saveAnalysis(DiaryAnalysisEntity analysis) {
        return diaryAnalysisRepository.save(analysis);
    }

    // AI 분석 조회
    public List<DiaryAnalysisEntity> getWeeklyAnalysis(Long memberId, Date start, Date end) {
        return diaryAnalysisRepository.findAll().stream()
                .filter(a -> a.getMember().getMemberId().equals(memberId)
                        && !a.getAnalysisTargetDate().before(start)
                        && !a.getAnalysisTargetDate().after(end))
                .toList();
    }

    // 내부 S3 업로드 메서드
    private String uploadToS3(MultipartFile file) {
        // TODO: 실제 S3 업로드 로직으로 교체
        return "https://s3.amazonaws.com/bucket-name/diary/" + file.getOriginalFilename();
    }
}
