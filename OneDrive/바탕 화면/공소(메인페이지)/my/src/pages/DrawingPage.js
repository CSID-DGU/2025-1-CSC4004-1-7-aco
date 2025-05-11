import React, { useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DrawingPage.css';
import Navigation from "../components/Navigation";

const DrawingPage = () => {
    const [lines, setLines] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const stageRef = useRef();

    const handleMouseDown = (e) => {
        setIsDrawing(true);
        const pos = e.target.getStage().getPointerPosition();
        setLines([...lines, { points: [pos.x, pos.y] }]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        setLines([...lines.slice(0, -1), lastLine]);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleClear = () => {
        setLines([]);
    };

    const handleSave = () => {
        // TODO: 그림 저장 로직 구현
        setShowModal(false);
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
        <div className="drawing-page">
            <Navigation />
            <div className="drawing-container">
                <div className="calendar-section">
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="calendar"
                    />
                    <div className="drawing-buttons">
                        <button onClick={() => handleConfirm('edit')}>수정하기</button>
                        <button onClick={() => handleConfirm('delete')}>삭제하기</button>
                    </div>
                </div>
                <div className="drawing-section">
                    <button onClick={() => setShowModal(true)}>그림 그리기</button>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>그림 그리기</h2>
                        <div className="canvas-container">
                            <Stage
                                width={500}
                                height={500}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                ref={stageRef}
                            >
                                <Layer>
                                    {lines.map((line, i) => (
                                        <Line
                                            key={i}
                                            points={line.points}
                                            stroke="#000000"
                                            strokeWidth={5}
                                            tension={0.5}
                                            lineCap="round"
                                            lineJoin="round"
                                        />
                                    ))}
                                </Layer>
                            </Stage>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleClear}>지우기</button>
                            <button onClick={handleSave}>저장하기</button>
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
        </div>
    );
};

export default DrawingPage;
