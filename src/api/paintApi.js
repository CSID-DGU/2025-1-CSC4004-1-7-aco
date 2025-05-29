import API from './API';

const BASE_URL = 'https://www.maeumnaru.shop/api';

// 그림 임시 저장
export const savePaintDraft = async (file, dto) => {
    const formData = new FormData();
    formData.append('file', file, 'drawing.png');
    const { title } = dto;
    formData.append('dto', new Blob([JSON.stringify({ title })], { type: 'application/json' }));

    const response = await API.post(`${BASE_URL}/paint/draft`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// 그림 최종 저장
export const finalizePaint = async (paintId, file, dto) => {
    const formData = new FormData();
    formData.append('file', file, 'drawing.png');
    const { title } = dto;
    formData.append('dto', new Blob([JSON.stringify({ title })], { type: 'application/json' }));

    const response = await API.post(`${BASE_URL}/paint/${paintId}/finalize`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// 그림 단건 조회
export const getPaintById = async (paintId) => {
    const response = await API.get(`${BASE_URL}/paint/${paintId}`);
    return response.data;
};

// 그림의 채팅 목록 조회
export const getChatsByPaintId = async (paintId) => {
    const response = await API.get(`${BASE_URL}/paint/${paintId}/chats`);
    return response.data;
};

// 채팅 답변 저장 및 다음 질문 받기
export const saveReplyAndGetNextQuestion = async (paintId, reply) => {
    const response = await API.post(`${BASE_URL}/paint/${paintId}/chat/reply`, reply, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// 대화 완료 저장
export const completeChat = async (paintId, chatRequestList) => {
    const response = await API.post(`${BASE_URL}/paint/${paintId}/chat/complete`, chatRequestList, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
};

// 그림 삭제
export const deletePaint = async (paintId) => {
    const response = await API.delete(`${BASE_URL}/paint/${paintId}`);
    return response.data;
}; 