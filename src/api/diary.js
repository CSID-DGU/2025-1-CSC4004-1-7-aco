import API from './API';
import axios from 'axios';


// 일기 생성
export async function createDiary(diary) {
    const formData = new FormData();
    // 본문을 txt 파일로 변환
    const textFile = new Blob([diary.text || ''], { type: 'text/plain' });
    // 파일명: 오늘 날짜 (YYYY-MM-DD).txt
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const fileName = `${yyyy}-${mm}-${dd}.txt`;
    // title, createDate만 포함
    const { title, createDate } = diary;
    const diaryMeta = { title, createDate };
    formData.append('diary', new Blob([JSON.stringify(diaryMeta)], { type: 'application/json' }));
    formData.append('file', textFile, fileName);
    console.log('[FormData][createDiary] diaryMeta:', diaryMeta);
    const file = formData.get('file');
    if (file) {
        file.text().then(text => console.log('[FormData][createDiary] file 내용:', text));
    }
    const res = await API.post('/diary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('[createDiary] response:', res);
    return res.data;
}

// 일기 수정
export async function updateDiary(diaryId, diary) {
    const formData = new FormData();
    const textFile = new Blob([diary.text || ''], { type: 'text/plain' });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const fileName = `${yyyy}-${mm}-${dd}.txt`;
    // title, createDate만 포함
    const { title, createDate } = diary;
    const diaryMeta = { title, createDate };
    formData.append('diary', new Blob([JSON.stringify(diaryMeta)], { type: 'application/json' }));
    formData.append('file', textFile, fileName);
    console.log('[FormData][updateDiary] diaryMeta:', diaryMeta);
    for (let pair of formData.entries()) {
        console.log('[FormData][updateDiary]', pair[0] + ':', pair[1]);
    }
    const file = formData.get('file');
    if (file) {
        file.text().then(text => console.log('[FormData][updateDiary] file 내용:', text));
    }
    const res = await API.put(`/diary/${diaryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
}

// 일기 삭제
export async function deleteDiary(diaryId) {
    const res = await API.delete(`/diary/${diaryId}`);
    console.log('[deleteDiary] response:', res);
    return res.data;
}

// 특정 날짜 일기 조회
export async function getDiaryByDate(date) {
    const res = await API.get(`/diary/by-date?date=${date}`);
    console.log('[getDiaryByDate] response:', res);
    return res.data || null;
}

// 일기 분석 결과 저장 또는 수정
export async function saveOrUpdateAnalysis(diaryId, analysisRequest) {
    const res = await API.post(`/diary/analysis/${diaryId}`, analysisRequest, {
        headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('accessToken') && {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            })
        }
    });
    console.log('[saveOrUpdateAnalysis] response:', res);
    return res.data;
}

// 단일 일기 분석 결과 조회
export async function getAnalysisByDiaryId(diaryId) {
    const res = await API.get(`/diary/analysis/${diaryId}`);
    console.log('[getAnalysisByDiaryId] response:', res);
    return res.data;
} 