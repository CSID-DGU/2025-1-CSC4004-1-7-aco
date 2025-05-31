import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from '../components/Calendar';
import './DrawingPage.css';
import Navigation from "../components/Navigation";
import { format } from 'date-fns';
import { savePaintDraft, finalizePaint, getPaintById, getChatsByPaintId, saveReplyAndGetNextQuestion, completeChat, deletePaint, getPaintByDate } from '../api/paintApi';

const DRAWING_STORAGE_KEY = 'drawing_records_v1';

const DrawingPageContainer = styled.div`
    width: 100vw;
    min-height: 100vh;
    background: transparent;
    position: relative;
    margin: 0 auto;
    top: -15.9px;
`;

const DrawingPage = () => {
    const canvasRef = useRef(null);
    const modalCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#F50F0F');
    const [lineWidth, setLineWidth] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [drawingTitle, setDrawingTitle] = useState("");
    const [savedImage, setSavedImage] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [drawingRecords, setDrawingRecords] = useState({});
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isFinalSaved, setIsFinalSaved] = useState(false);
    const [isPastDrawing, setIsPastDrawing] = useState(false);
    const [paintId, setPaintId] = useState(null);
    const [paintInfo, setPaintInfo] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    const colors = [
        '#000000', // 검정
        '#F50F0F', // 빨강
        '#2E2AFF', // 파랑
        '#752AFF', // 보라
        '#B86DFF', // 연보라
        '#FF7626', // 진주황
        '#26A5FF', // 하늘색
        '#13C213', // 초록 (새로 추가)
        'eraser', // 지우개
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 560;
        canvas.height = 440;
    }, []);

    useEffect(() => {
        if (showModal && modalCanvasRef.current) {
            const canvas = modalCanvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = 800;
            canvas.height = 600;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [showModal]);

    useEffect(() => {
        const saved = localStorage.getItem(DRAWING_STORAGE_KEY);
        if (saved) {
            setDrawingRecords(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        if (drawingRecords[dateKey]) {
            const img = new window.Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = drawingRecords[dateKey].image;
            setIsFinalSaved(true);
            setIsPastDrawing(!isToday(selectedDate));
        } else {
            setIsFinalSaved(false);
            setIsPastDrawing(!isToday(selectedDate));
        }
    }, [selectedDate, drawingRecords]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    useEffect(() => {
        if (showChatModal && paintId) {
            (async () => {
                try {
                    // 그림 정보 조회
                    const paint = await getPaintById(paintId);
                    setPaintInfo(paint);

                    // 대화 목록 조회
                    const chats = await getChatsByPaintId(paintId);
                    setChatList(chats);
                } catch (e) {
                    console.error('데이터 조회 실패:', e);
                    setChatList([]);
                }
            })();
        }
    }, [showChatModal, paintId]);

    const getMousePosition = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e, isModal = false) => {
        const canvas = isModal ? modalCanvasRef.current : canvasRef.current;
        const { x, y } = getMousePosition(e, canvas);
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = currentColor === 'eraser' ? '#FFFFFF' : currentColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setIsDrawing(true);
    };

    const draw = (e, isModal = false) => {
        if (!isDrawing) return;
        const canvas = isModal ? modalCanvasRef.current : canvasRef.current;
        const { x, y } = getMousePosition(e, canvas);
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = currentColor === 'eraser' ? '#FFFFFF' : currentColor;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = (isModal = false) => {
        const canvas = isModal ? modalCanvasRef.current : canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleTempSave = async () => {
        const canvas = showModal ? modalCanvasRef.current : canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const patientCode = Number(localStorage.getItem('patientCode'));
        const dto = { patientCode, title: drawingTitle };
        try {
            const res = await savePaintDraft(blob, dto);
            setPaintId(res.paintId);
            setPaintInfo(res);
            setSavedImage(dataUrl);
            alert('임시저장되었습니다.');
        } catch (e) {
            alert('임시저장 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleTempSaveWithTitle = async () => {
        if (!drawingTitle.trim()) {
            alert('제목을 입력해주세요!');
            return;
        }
        await handleTempSave();
        setShowTitleModal(false);
    };

    const handleFinalSave = async () => {
        const canvas = showModal ? modalCanvasRef.current : canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const patientCode = Number(localStorage.getItem('patientCode'));
        const dto = { patientCode, title: drawingTitle };

        try {
            let id = paintId;
            if (!id) {
                // 임시 저장이 되어있지 않은 경우, 먼저 임시 저장
                const res = await savePaintDraft(blob, dto);
                id = res.paintId;
                setPaintId(id);
                setPaintInfo(res);
            } else {
                // 기존 그림 정보 조회
                const paint = await getPaintById(id);
                setPaintInfo(paint);
            }

            // 최종 저장
            await finalizePaint(id, blob, dto);
            setSavedImage(dataUrl);
            setIsFinalSaved(true);
            alert('최종저장되었습니다.');
        } catch (e) {
            alert('최종저장 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleCompleteChat = async () => {
        if (!paintId) return;
        try {
            // 채팅 목록에서 대화 쌍을 추출
            const chatRequestList = [];
            let lastBot = null;

            chatList.forEach(chat => {
                if (chat.writerType === 'CHATBOT') {
                    lastBot = chat.comment;
                } else if (chat.writerType === 'PATIENT' && lastBot) {
                    // 봇 질문과 사용자 응답 쌍을 생성
                    chatRequestList.push({
                        paintId,
                        chatbotComment: lastBot,
                        patientComment: chat.comment
                    });
                    lastBot = null;
                }
            });

            // 대화 완료 저장
            await completeChat(paintId, chatRequestList);
            alert('대화가 저장되었습니다.');
            setShowChatModal(false);
        } catch (e) {
            alert('대화 저장 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    const saveDrawing = (isModal = false) => {
        setShowTitleModal(true);
    };

    const saveRecord = (dateKey, record) => {
        const newRecords = { ...drawingRecords, [dateKey]: record };
        setDrawingRecords(newRecords);
        localStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify(newRecords));
    };

    const handleTitleSave = () => {
        const canvas = showModal ? modalCanvasRef.current : canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        setSavedImage(dataUrl);
        setShowTitleModal(false);
        setShowChatModal(true);
        setIsFinalSaved(true);
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        saveRecord(dateKey, { title: drawingTitle, image: dataUrl, chats: [] });
        if (showModal) setShowModal(false);
    };

    const handleDelete = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        try {
            if (paintId) {
                // 서버에서 그림 삭제
                await deletePaint(paintId);
            }

            // 로컬 상태 업데이트
            const dateKey = format(selectedDate, 'yyyy-MM-dd');
            const newRecords = { ...drawingRecords };
            delete newRecords[dateKey];
            setDrawingRecords(newRecords);
            localStorage.setItem(DRAWING_STORAGE_KEY, JSON.stringify(newRecords));

            if (isToday(selectedDate)) {
                setIsFinalSaved(false);
                setIsPastDrawing(false);
                clearCanvas();
            } else {
                setIsFinalSaved(true);
                setIsPastDrawing(true);
            }
            setShowConfirmModal(false);
            setPaintId(null);
            setPaintInfo(null);
        } catch (e) {
            alert('삭제 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const renderDayContents = (day, date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const hasDrawing = !!drawingRecords[dateKey];
        return (
            <div style={{ position: 'relative' }}>
                <span>{day}</span>
                {hasDrawing && (
                    <span style={{ position: 'absolute', right: 2, bottom: 2, width: 6, height: 6, background: '#0089ED', borderRadius: '50%', display: 'inline-block' }}></span>
                )}
            </div>
        );
    };

    const handleCalendarClick = async (date) => {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        const dateKey = format(date, 'yyyy-MM-dd');
        try {
            const paint = await getPaintByDate(dateKey);
            if (paint && paint.paintId) {
                setPaintId(paint.paintId);
                setPaintInfo(paint);
                setSavedImage(paint.fileUrl);
                setIsFinalSaved(true);
                setIsPastDrawing(!isToday(date));
            } else {
                setPaintId(null);
                setPaintInfo(null);
                setSavedImage(null);
                setIsFinalSaved(false);
                setIsPastDrawing(!isToday(date));
            }
        } catch (e) {
            setPaintId(null);
            setPaintInfo(null);
            setSavedImage(null);
            setIsFinalSaved(false);
            setIsPastDrawing(!isToday(date));
        }
    };

    const handleChangeMonth = (date) => {
        setCurrentMonth(date);
    };

    const openModal = () => {
        setShowModal(true);
        setTimeout(() => {
            const mainCanvas = canvasRef.current;
            const modalCanvas = modalCanvasRef.current;
            if (mainCanvas && modalCanvas) {
                const img = new window.Image();
                img.onload = () => {
                    const ctx = modalCanvas.getContext('2d');
                    ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
                    ctx.drawImage(img, 0, 0, modalCanvas.width, modalCanvas.height);
                };
                img.src = mainCanvas.toDataURL();
            }
        }, 50);
    };

    const closeModal = () => {
        const mainCanvas = canvasRef.current;
        const modalCanvas = modalCanvasRef.current;
        if (mainCanvas && modalCanvas) {
            const img = new window.Image();
            img.onload = () => {
                const ctx = mainCanvas.getContext('2d');
                ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
                ctx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
            };
            img.src = modalCanvas.toDataURL();
        }
        setShowModal(false);
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || !paintId) return;
        setIsChatLoading(true);
        try {
            // 사용자 응답 저장 및 다음 질문 받기
            const nextQuestion = await saveReplyAndGetNextQuestion(paintId, chatInput);

            // 채팅 목록 업데이트
            setChatList(prev => ([
                ...prev,
                {
                    writerType: 'PATIENT',
                    comment: chatInput,
                    chatDate: new Date().toISOString()
                },
                {
                    writerType: 'CHATBOT',
                    comment: nextQuestion,
                    chatDate: new Date().toISOString()
                }
            ]));

            // 입력창 초기화
            setChatInput("");
        } catch (e) {
            alert('메시지 전송 실패: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <DrawingPageContainer>
            <Navigation />
            <MainContent>
                <CalendarWrapper>
                    <Calendar
                        selectedDate={selectedDate}
                        onSelectDate={handleCalendarClick}
                        tileContent={({ date, view }) => view === 'month' ? renderDayContents(date.getDate(), date) : null}
                        currentMonth={currentMonth}
                        onChangeMonth={handleChangeMonth}
                    />
                </CalendarWrapper>
                <DrawingArea>
                    <ColorPalette>
                        <ZoomButton onClick={openModal} disabled={isFinalSaved || isPastDrawing}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill={(isFinalSaved || isPastDrawing) ? "#ccc" : "#000000"} />
                            </svg>
                        </ZoomButton>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                            <input
                                type="range"
                                min={1}
                                max={20}
                                value={lineWidth}
                                onChange={e => !isPastDrawing && setLineWidth(Number(e.target.value))}
                                style={{ width: 80, opacity: isPastDrawing ? 0.5 : 1 }}
                                disabled={isPastDrawing}
                            />
                            <span style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
                                {lineWidth}px
                            </span>
                        </div>
                        <ColorGrid>
                            {colors.map((color) => (
                                <ColorButton
                                    key={color}
                                    active={currentColor === color}
                                    onClick={() => !isPastDrawing && setCurrentColor(color)}
                                    style={color === 'eraser' ? { border: '2px dashed #888', background: '#fff' } : { background: color }}
                                    disabled={isPastDrawing}
                                >
                                    {color === 'eraser' ? '' : ''}
                                </ColorButton>
                            ))}
                        </ColorGrid>
                    </ColorPalette>
                    <Canvas
                        ref={canvasRef}
                        onMouseDown={(e) => !isFinalSaved && !isPastDrawing && startDrawing(e, false)}
                        onMouseMove={(e) => !isFinalSaved && !isPastDrawing && draw(e, false)}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        style={{ cursor: isFinalSaved || isPastDrawing ? 'not-allowed' : 'crosshair' }}
                    />
                    <ButtonGroup>
                        {isFinalSaved ? (
                            <DeleteButton onClick={handleDelete}>삭제하기</DeleteButton>
                        ) : !isPastDrawing ? (
                            <>
                                <Button onClick={() => clearCanvas(false)}>지우기</Button>
                                <TempSaveButton onClick={() => setShowTitleModal(true)} disabled={isPastDrawing}>임시저장</TempSaveButton>
                                <SaveButton onClick={() => saveDrawing(false)}>최종저장</SaveButton>
                            </>
                        ) : null}
                    </ButtonGroup>
                </DrawingArea>
            </MainContent>

            {showModal && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            <h2>그림 그리기</h2>
                            <CloseButton onClick={closeModal}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '32px', minWidth: '90px' }}>
                                <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    value={lineWidth}
                                    onChange={e => !isPastDrawing && setLineWidth(Number(e.target.value))}
                                    style={{ width: 80, opacity: isPastDrawing ? 0.5 : 1 }}
                                    disabled={isPastDrawing}
                                />
                                <span style={{ fontSize: 13, color: '#333', marginTop: 4 }}>
                                    {lineWidth}px
                                </span>
                                <ModalColorPalette>
                                    {colors.map((color) => (
                                        <ModalColorButton
                                            key={color}
                                            active={currentColor === color}
                                            onClick={() => !isPastDrawing && setCurrentColor(color)}
                                            style={color === 'eraser' ? { border: '2px dashed #888', background: '#fff' } : { background: color }}
                                            disabled={isPastDrawing}
                                        >
                                            {color === 'eraser' ? '' : ''}
                                        </ModalColorButton>
                                    ))}
                                </ModalColorPalette>
                            </div>
                            <ModalCanvas
                                ref={modalCanvasRef}
                                onMouseDown={(e) => !isPastDrawing && startDrawing(e, true)}
                                onMouseMove={(e) => !isPastDrawing && draw(e, true)}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                                style={{ cursor: isPastDrawing ? 'not-allowed' : 'crosshair' }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => clearCanvas(true)} disabled={isPastDrawing}>지우기</Button>
                            <TempSaveButton onClick={() => setShowTitleModal(true)} disabled={isPastDrawing}>임시저장</TempSaveButton>
                            <SaveButton onClick={() => saveDrawing(true)} disabled={isPastDrawing}>최종저장</SaveButton>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showConfirmModal && (
                <ModalOverlay>
                    <ModalContent>
                        <h2>확인</h2>
                        <p>정말로 삭제하시겠습니까?</p>
                        <ModalFooter>
                            <Button onClick={handleConfirmAction}>확인</Button>
                            <Button onClick={() => setShowConfirmModal(false)}>취소</Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showTitleModal && (
                <ModalOverlay>
                    <ModalContent style={{ width: '400px', maxWidth: '90%' }}>
                        <ModalHeader>
                            <h2>그림의 제목을 입력해주세요</h2>
                        </ModalHeader>
                        <ModalBody style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={drawingTitle}
                                onChange={e => setDrawingTitle(e.target.value)}
                                placeholder="제목을 입력하세요"
                                style={{ width: '90%', padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={handleTempSaveWithTitle} disabled={!drawingTitle.trim()}>저장</Button>
                            <Button onClick={() => setShowTitleModal(false)}>취소</Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showChatModal && (
                <ModalOverlay>
                    <ModalContent style={{ width: '900px', minHeight: '600px', maxWidth: '98%' }}>
                        <ModalHeader>
                            <h2>{paintInfo?.title || drawingTitle}</h2>
                        </ModalHeader>
                        <ModalBody style={{ gap: '40px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={paintInfo?.fileUrl || savedImage}
                                    alt="그림 미리보기"
                                    style={{
                                        maxWidth: '350px',
                                        maxHeight: '350px',
                                        borderRadius: '16px',
                                        background: '#e3e3e3'
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    background: '#f7f7fa',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    minHeight: '300px'
                                }}>
                                    {chatList.length === 0 ? (
                                        <div style={{ color: '#888', textAlign: 'center', marginTop: '40%' }}>
                                            AI 챗봇과의 대화가 여기에 표시됩니다.
                                        </div>
                                    ) : (
                                        chatList.map((chat) => (
                                            <div
                                                key={chat.chatId}
                                                style={{
                                                    textAlign: chat.writerType === 'PATIENT' ? 'right' : 'left',
                                                    margin: '8px 0'
                                                }}
                                            >
                                                <span style={{
                                                    display: 'inline-block',
                                                    background: chat.writerType === 'PATIENT' ? '#dbeafe' : '#fff',
                                                    color: '#222',
                                                    borderRadius: '12px',
                                                    padding: '8px 14px',
                                                    maxWidth: '70%',
                                                    wordBreak: 'break-all',
                                                    fontSize: 15
                                                }}>
                                                    {chat.comment}
                                                </span>
                                                <span style={{
                                                    fontSize: 12,
                                                    color: '#888',
                                                    marginLeft: 8
                                                }}>
                                                    {new Date(chat.chatDate).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            fontSize: '16px',
                                            backgroundColor: isFinalSaved ? '#f5f5f5' : '#fff',
                                            cursor: isFinalSaved ? 'not-allowed' : 'text'
                                        }}
                                        placeholder="메시지를 입력하세요"
                                        disabled={isFinalSaved || isChatLoading}
                                    />
                                    <Button
                                        style={{
                                            minWidth: '60px',
                                            backgroundColor: isFinalSaved ? '#ccc' : '#fff',
                                            cursor: isFinalSaved ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={isFinalSaved || isChatLoading || !chatInput.trim()}
                                        onClick={handleSendChat}
                                    >
                                        전송
                                    </Button>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <CompleteButton onClick={handleCompleteChat}>대화 완료</CompleteButton>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}

            {selectedRecord && (
                <ModalOverlay>
                    <ModalContent style={{ width: '900px', minHeight: '600px', maxWidth: '98%' }}>
                        <ModalHeader>
                            <h2>{selectedRecord.title}</h2>
                            <CloseButton onClick={() => setSelectedRecord(null)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ gap: '40px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img src={selectedRecord.image} alt="그림 미리보기" style={{ maxWidth: '350px', maxHeight: '350px', borderRadius: '16px', background: '#e3e3e3' }} />
                            </div>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1, overflowY: 'auto', background: '#f7f7fa', borderRadius: '12px', padding: '16px', marginBottom: '12px', minHeight: '300px' }}>
                                    <div style={{ color: '#888', textAlign: 'center', marginTop: '40%' }}>AI 챗봇과의 대화가 여기에 표시됩니다.</div>
                                </div>
                            </div>
                        </ModalBody>
                    </ModalContent>
                </ModalOverlay>
            )}
        </DrawingPageContainer>
    );
};

const MainContent = styled.main`
    width: 100vw;
    min-height: calc(100vh - 120px);
    margin: 0 auto;
    margin-top: 120px;
    display: flex;
    gap: 60px;
    justify-content: center;
    align-items: flex-start;
`;

const CalendarWrapper = styled.div`
    width: 420px;
    height: 497px;
    background: #fff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
`;

const DrawingArea = styled.div`
    position: relative;
    width: 700px;
    height: 550px;
    background: rgba(213, 233, 249, 0.85);
    border-radius: 25px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 40px;
    overflow: visible;
`;

const ColorPalette = styled.div`
    position: absolute;
    right: 20px;
    top: 15px;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ColorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 8px;
`;

const ColorButton = styled.button`
    width: 34px;
    height: 34px;
    background: ${props => props.color};
    border-radius: 8px;
    border: none;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
    transition: transform 0.2s;
    opacity: ${props => props.disabled ? 0.5 : 1};
    &:hover {
        transform: ${props => props.disabled ? 'scale(1)' : 'scale(1.1)'};
    }
`;

const Canvas = styled.canvas`
    position: absolute;
    left: 15px;
    top: 15px;
    background: #FFFFFF;
    border-radius: 20px;
    cursor: crosshair;
    width: 600px;
    height: 490px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ButtonGroup = styled.div`
    position: absolute;
    bottom: 15px;
    right: 15px;
    display: flex;
    gap: 11px;
`;

const Button = styled.button`
    width: 100px;
    height: 40px;
    background: #FFFFFF;
    border: 1px solid #000000;
    border-radius: 100px;
    font-family: 'Roboto';
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
        background: #f5f5f5;
        transform: scale(1.1);
    }
`;

const SaveButton = styled(Button)`
    background: #0089ED;
    color: #FFFFFF;
    border: none;
`;

const TempSaveButton = styled(Button)`
    background: #FFFFFF;
    color: #000000;
    border: 1px solid #000000;
`;

const CompleteButton = styled(Button)`
    background: #0089ED;
    color: #FFFFFF;
    border: none;
    width: 120px;
`;

const DeleteButton = styled(Button)`
    background: #FF4444;
    color: #FFFFFF;
    border: none;
    &:hover {
        background: #FF0000;
    }
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: #FFFFFF;
    padding: 30px;
    border-radius: 20px;
    width: 1000px;
    max-width: 90%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        font-family: 'Plus Jakarta Sans';
        font-weight: 600;
        font-size: 24px;
        margin: 0;
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: transform 0.2s;
    &:hover {
        transform: scale(1.1);
    }
`;

const ModalBody = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
`;

const ModalColorPalette = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ModalColorButton = styled(ColorButton)`
    width: 48px;
    height: 48px;
    transition: transform 0.2s;
    &:hover {
        transform: scale(1.1);
    }
`;

const ModalCanvas = styled.canvas`
    flex: 1;
    background: #FFFFFF;
    border-radius: 20px;
    cursor: crosshair;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: center;
    gap: 11px;
`;

const ZoomButton = styled.button`
    width: 38px;
    height: 38px;
    background: #FFFFFF;
    border: 1px solid #000000;
    border-radius: 10px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    transition: transform 0.2s;
    opacity: ${props => props.disabled ? 0.5 : 1};
    &:hover {
        transform: ${props => props.disabled ? 'scale(1)' : 'scale(1.1)'};
    }
`;

export default DrawingPage;