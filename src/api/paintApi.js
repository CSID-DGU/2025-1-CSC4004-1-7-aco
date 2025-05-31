import API from './API';


// 그림 임시 저장
export const savePaintDraft = async (file, dto) => {
    // dto에 title과 createDate(YYYY-MM-DD)만 포함
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const createDate = `${yyyy}-${mm}-${dd}`;
    const payload = {
        title: dto.title,
        createDate: createDate
    };
    const formData = new FormData();
    formData.append('file', file, `${yyyy}-${mm}-${dd}.png`);
    formData.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    // FormData 내용 출력
    for (let pair of formData.entries()) {
        console.log('[FormData][savePaintDraft]', pair[0] + ':', pair[1]);
    }
    console.log('[FormData][savePaintDraft] dto:', payload);
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('[FormData][savePaintDraft] file(base64):', e.target.result.slice(0, 100) + '...');
        };
        reader.readAsDataURL(file);
    }
    const response = await API.post('/paint', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    console.log('[savePaintDraft] response:', response);
    return response.data;
};

// 그림 최종 저장
export const finalizePaint = async (paintId, file, dto) => {
    const formData = new FormData();
    formData.append('file', file, 'drawing.png');
    const { title } = dto;
    formData.append('dto', new Blob([JSON.stringify({ title })], { type: 'application/json' }));

    const response = await API.post(`/paint/${paintId}/finalize`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    console.log('[finalizePaint] response:', response);
    return response.data;
};

// 그림 단건 조회
export const getPaintById = async (paintId) => {
    const response = await API.get(`/paint/${paintId}`);
    console.log('[getPaintById] response:', response);
    return response.data;
};

// 그림의 채팅 목록 조회
export const getChatsByPaintId = async (paintId) => {
    const response = await API.get(`/paint/${paintId}/chats`);
    console.log('[getChatsByPaintId] response:', response);
    return response.data;
};

// 채팅 답변 저장 및 다음 질문 받기
export const saveReplyAndGetNextQuestion = async (paintId, reply) => {
    const response = await API.post(`/paint/${paintId}/chat/reply`, reply, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log('[saveReplyAndGetNextQuestion] response:', response);
    return response.data;
};

// 대화 완료 저장
export const completeChat = async (paintId, chatRequestList) => {
    const response = await API.post(`/paint/${paintId}/chat/complete`, chatRequestList, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log('[completeChat] response:', response);
    return response.data;
};

// 그림 삭제
export const deletePaint = async (paintId) => {
    const response = await API.delete(`/paint/${paintId}`);
    console.log('[deletePaint] response:', response);
    return response.data;
};

// 쿠키에서 accessToken을 읽는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// 특정 날짜 그림 조회
export const getPaintByDate = async (date) => {
    const response = await API.get(`/paint/by-date?date=${date}`);
    console.log('[getPaintByDate] response:', response);
    return response.data;
}; 