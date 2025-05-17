import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from '../components/Calendar';
import './DrawingPage.css';
import Navigation from "../components/Navigation";

const DrawingPage = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#F50F0F');
    const [lineWidth, setLineWidth] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const colors = [
        '#F50F0F', // 빨강
        '#2E2AFF', // 파랑
        '#752AFF', // 보라
        '#B86DFF', // 연보라
        '#FFBD6D', // 주황
        '#FF7626', // 진주황
        '#26A5FF', // 하늘색
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // 캔버스 크기 설정
        canvas.width = 560;
        canvas.height = 440;

        // 초기 설정
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [currentColor, lineWidth]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'my-drawing.png';
        link.href = dataUrl;
        link.click();
    };

    const handleConfirm = (action) => {
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    const handleConfirmAction = () => {
        if (confirmAction === 'delete') {
            // TODO: 그림 삭제 로직 구현
        } else if (confirmAction === 'edit') {
            setShowModal(true);
        }
        setShowConfirmModal(false);
    };

    return (
        <Container>
            <Navigation />
            <MainContent>
                <CalendarWrapper>
                    <Calendar />
                </CalendarWrapper>
                <DrawingArea>
                    <ColorPalette>
                        {colors.map((color) => (
                            <ColorButton
                                key={color}
                                color={color}
                                active={currentColor === color}
                                onClick={() => setCurrentColor(color)}
                            />
                        ))}
                    </ColorPalette>
                    <Canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                    />
                    <ButtonGroup>
                        <Button onClick={clearCanvas}>지우기</Button>
                        <Button onClick={saveDrawing}>저장</Button>
                    </ButtonGroup>
                </DrawingArea>
            </MainContent>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>그림 그리기</h2>
                        <div className="canvas-container">
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={500}
                                style={{ border: '1px solid black' }}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={clearCanvas}>지우기</button>
                            <button onClick={saveDrawing}>저장하기</button>
                            <button onClick={() => setShowModal(false)}>닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>확인</h2>
                        <p>정말로 {confirmAction === 'delete' ? '삭제' : '수정'}하시겠습니까?</p>
                        <div className="modal-buttons">
                            <button onClick={handleConfirmAction}>확인</button>
                            <button onClick={() => setShowConfirmModal(false)}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
};

const Container = styled.div`
    width: 1600px;
    height: 1024px;
    background: #FFFFFF;
    position: relative;
    margin: 0 auto;
`;

const MainContent = styled.main`
    width: 1600px;
    margin: 0 auto;
    margin-top: 120px;
    margin-left: 0;
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
    background: #D5E9F9;
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

const ColorButton = styled.button`
    width: 38px;
    height: 38px;
    background: ${props => props.color};
    border-radius: 10px;
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
    height: 49 0px;
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
    
    &:hover {
        background: #f5f5f5;
    }
`;

export default DrawingPage;
