import API from '../api/API';

// 일기 생성
export const createDiary = async (diary, file) => {
    const formData = new FormData();
    formData.append('diary', new Blob([JSON.stringify(diary)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    const res = await API.post('/diary', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// 일기 수정
export const updateDiary = async (diaryId, diary, file) => {
    const formData = new FormData();
    formData.append('diary', new Blob([JSON.stringify(diary)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    const res = await API.put(`/diary/${diaryId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// 일기 삭제
export const deleteDiary = async (diaryId) => {
    await API.delete(`/diary/${diaryId}`);
};

// 일기 단건 조회
export const getDiaryById = async (diaryId) => {
    const res = await API.get(`/diary/${diaryId}`);
    return res.data;
};

// 특정 날짜의 일기 목록 조회
export const getDiariesByDate = async (date) => {
    const res = await API.get(`/diary/by-date`, { params: { date } });
    return res.data;
};

// 최근 7일간 일기 목록 조회
export const getDiariesForPast7Days = async (baseDate) => {
    const res = await API.get(`/diary/7days`, { params: { baseDate } });
    return res.data;
}; 