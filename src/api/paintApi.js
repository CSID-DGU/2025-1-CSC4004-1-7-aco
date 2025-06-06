import API from './API';


// 그림 임시 저장
export const savePaintDraft = async (file, dto, paintId) => {
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
    if (paintId) formData.append('paintId', String(paintId));
    // file을 type 명시적으로 지정해서 FormData에 추가
    let fileToSend = file;
    if (!(file instanceof File)) {
        // file이 Blob이면 File로 변환 (name, type 지정)
        fileToSend = new File([file], `${yyyy}-${mm}-${dd}.png`, { type: 'image/png' });
    }
    formData.append('file', fileToSend, `${yyyy}-${mm}-${dd}.png`);
    formData.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    // FormData 모든 데이터 및 content-type 출력
    console.log('--- [savePaintDraft] FormData 전송 데이터 ---');
    for (let pair of formData.entries()) {
        if (pair[0] === 'file' && pair[1] instanceof File) {
            console.log('file:', pair[1].name, 'type:', pair[1].type, pair[1]);
        } else if (pair[0] === 'dto' && pair[1] instanceof Blob) {
            pair[1].text().then(text => {
                console.log('dto:', text, 'type:', pair[1].type, pair[1]);
            });
        } else {
            console.log(pair[0] + ':', pair[1], 'type:', typeof pair[1]);
        }
    }
    if (!paintId) console.log('paintId: (없음, 최초 저장)');
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('[FormData][savePaintDraft] file(base64):', e.target.result.slice(0, 100) + '...');
        };
        reader.readAsDataURL(file);
    }
    const response = await API.post('/paint/draft', formData);
    console.log('[savePaintDraft] response:', response);
    return response.data;
};

// 그림 최종 저장
export const finalizePaint = async (file, dto) => {
    // createDate를 string(YYYY-MM-DD)으로 변환
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const createDate = `${yyyy}-${mm}-${dd}`;
    const payload = {
        ...dto,
        createDate: createDate
    };
    const formData = new FormData();
    // file을 type 명시적으로 지정해서 FormData에 추가 (최종저장)
    let fileToSendFinal = file;
    if (!(file instanceof File)) {
        fileToSendFinal = new File([file], 'drawing.png', { type: 'image/png' });
    }
    formData.append('file', fileToSendFinal, 'drawing.png');
    formData.append('dto', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    const response = await API.post(`/paint/finalize`, formData);
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
    const url = `/paint/by-date?date=${date}`;
    console.log('[getPaintByDate] 요청 URL:', url);
    console.log('[getPaintByDate] 요청 파라미터:', { date });
    const response = await API.get(url);
    console.log('[getPaintByDate] 응답:', response);
    return response.data;
}; 