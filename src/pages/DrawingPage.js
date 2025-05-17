import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from '../components/Calendar';
import './DrawingPage.css';
import Navigation from "../components/Navigation";
import { format } from 'date-fns';

const DRAWING_STORAGE_KEY = 'drawing_records_v1';

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
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [showModal, currentColor, lineWidth]);

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
        }
    }, [selectedDate, drawingRecords]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

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
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        saveRecord(dateKey, { title: drawingTitle, image: dataUrl, chats: [] });
    };

    const handleConfirmAction = () => {
        clearCanvas();
        setShowConfirmModal(false);
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

    const handleCalendarClick = (date) => {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        const dateKey = format(date, 'yyyy-MM-dd');
        if (drawingRecords[dateKey]) {
            setSelectedRecord(drawingRecords[dateKey]);
        } else {
            setSelectedRecord(null);
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

    return (
        <Container>
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
                        <ZoomButton onClick={openModal}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#000000" />
                            </svg>
                        </ZoomButton>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                            <input
                                type="range"
                                min={1}
                                max={20}
                                value={lineWidth}
                                onChange={e => setLineWidth(Number(e.target.value))}
                                style={{ width: 80 }}
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
                                    onClick={() => setCurrentColor(color)}
                                    style={color === 'eraser' ? { border: '2px dashed #888', background: '#fff' } : { background: color }}
                                >
                                    {color === 'eraser' ? '' : ''}
                                </ColorButton>
                            ))}
                        </ColorGrid>
                    </ColorPalette>
                    <Canvas
                        ref={canvasRef}
                        onMouseDown={(e) => startDrawing(e, false)}
                        onMouseMove={(e) => draw(e, false)}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                    />
                    <ButtonGroup>
                        <Button onClick={() => clearCanvas(false)}>지우기</Button>
                        <Button onClick={() => saveDrawing(false)}>저장</Button>
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
                            <ModalColorPalette>
                                {colors.map((color) => (
                                    <ModalColorButton
                                        key={color}
                                        active={currentColor === color}
                                        onClick={() => setCurrentColor(color)}
                                        style={color === 'eraser' ? { border: '2px dashed #888', background: '#fff' } : { background: color }}
                                    >
                                        {color === 'eraser' ? '' : ''}
                                    </ModalColorButton>
                                ))}
                            </ModalColorPalette>
                            <ModalCanvas
                                ref={modalCanvasRef}
                                onMouseDown={(e) => startDrawing(e, true)}
                                onMouseMove={(e) => draw(e, true)}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => clearCanvas(true)}>지우기</Button>
                            <Button onClick={() => saveDrawing(true)}>저장</Button>
                            <Button onClick={closeModal}>닫기</Button>
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
                            <Button onClick={handleTitleSave} disabled={!drawingTitle.trim()}>저장</Button>
                            <Button onClick={() => setShowTitleModal(false)}>취소</Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}

            {showChatModal && (
                <ModalOverlay>
                    <ModalContent style={{ width: '900px', minHeight: '600px', maxWidth: '98%' }}>
                        <ModalHeader>
                            <h2>{drawingTitle}</h2>
                            <CloseButton onClick={() => setShowChatModal(false)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody style={{ gap: '40px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img src={savedImage} alt="그림 미리보기" style={{ maxWidth: '350px', maxHeight: '350px', borderRadius: '16px', background: '#e3e3e3' }} />
                            </div>
                            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1, overflowY: 'auto', background: '#f7f7fa', borderRadius: '12px', padding: '16px', marginBottom: '12px', minHeight: '300px' }}>
                                    <div style={{ color: '#888', textAlign: 'center', marginTop: '40%' }}>AI 챗봇과의 대화가 여기에 표시됩니다.</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} placeholder="메시지를 입력하세요" />
                                    <Button style={{ minWidth: '60px' }}>전송</Button>
                                </div>
                            </div>
                        </ModalBody>
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
        </Container>
    );
};

const Container = styled.div`
    width: 100vw;
    min-height: 100vh;
    background: transparent;
    position: relative;
    margin: 0 auto;
`;

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
    cursor: pointer;
    transform: ${props => props.active ? 'scale(1.1)' : 'scale(1)'};
    transition: transform 0.2s;
    &:hover {
        transform: scale(1.1);
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
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    transition: transform 0.2s;
    &:hover {
        transform: scale(1.1);
    }
`;

export default DrawingPage;
