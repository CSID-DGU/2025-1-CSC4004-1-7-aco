import API from '../api/API';

// 1. ID로 그림 조회
export const getPaintById = async (id) => {
    const res = await API.get(`/paint/${id}`);
    return res.data;
};

// 2. 임시저장 (file + dto)
export const savePaintDraft = async (file, dto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    const res = await API.post('/paint/draft', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

// 3. 최종저장 (file + dto)
export const finalizePaint = async (id, file, dto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    await API.post(`/paint/${id}/finalize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// 4. 그림 수정 (PaintEntity 전체)
export const updatePaint = async (id, updatedPaint) => {
    const res = await API.put(`/paint/${id}`, updatedPaint);
    return res.data;
};

// 5. 그림 삭제
export const deletePaint = async (id) => {
    await API.delete(`/paint/${id}`);
};

// 6. 그림의 채팅 목록 조회
export const getChatsByPaintId = async (id) => {
    const res = await API.get(`/paint/${id}/chats`);
    return res.data;
};

// 7. 환자 답변 저장 + 다음 질문 받기
export const saveReplyAndGetNextQuestion = async (id, patientReply) => {
    const res = await API.post(`/paint/${id}/chat/reply`, patientReply, {
        headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
};

// 8. 채팅 완료(전체 리스트 저장)
export const completeChat = async (id, chatList) => {
    await API.post(`/paint/${id}/chat/complete`, chatList, {
        headers: { 'Content-Type': 'application/json' }
    });
}; 