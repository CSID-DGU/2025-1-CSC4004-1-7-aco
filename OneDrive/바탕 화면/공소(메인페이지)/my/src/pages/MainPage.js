import React, { useState } from "react";
import Navigation from "../components/Navigation";
import MyCalendar from "../components/Calendar";
import DiaryEditor from "../components/DiaryEditor";
import DiaryModal from "../components/DiaryModal";
import ConfirmModal from "../components/ConfirmModal";
import AnalysisModal from "../components/AnalysisModal";

function MainPage() {
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [analysisResult, setAnalysisResult] = useState("");
    const [diaries, setDiaries] = useState({});
    const dateKey = date.toISOString().slice(0, 10);

    // 예시: 날짜별 감정 상태에 따라 색상 클래스 부여
    const emotionMap = {
        "2025-04-11": "sad",
        "2025-04-12": "normal",
        "2025-04-13": "happy",
        // ...
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const key = date.toISOString().slice(0, 10);
            return emotionMap[key] ? `calendar-cell ${emotionMap[key]}` : null;
        }
    };

    // 오늘 날짜 판별
    const isToday = (d) => {
        const today = new Date();
        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    };

    // 저장 버튼 클릭 시
    const handleSaveClick = () => {
        setIsConfirmOpen(true);
    };

    // "등록하시겠습니까?"에서 "네" 클릭 시
    const handleConfirm = () => {
        setIsConfirmOpen(false);
        setIsModalOpen(false);
        setIsLoading(true);
        // 분석 로딩 후 결과 표시
        setTimeout(() => {
            setIsLoading(false);
            setIsAnalysisOpen(true);
            setAnalysisResult("오늘의 감정: 행복 (예시)\n긍정적인 하루를 보내셨네요!");
        }, 1500);
    };

    // 일기 저장
    const handleSave = (dateKey, text) => {
        setDiaries({ ...diaries, [dateKey]: text });
    };

    // 일기 전체 삭제
    const handleDelete = (dateKey) => {
        const newDiaries = { ...diaries };
        delete newDiaries[dateKey];
        setDiaries(newDiaries);
        setIsModalOpen(false);
    };

    return (
        <div>
            <Navigation />
            <div className="main-content">
                <MyCalendar
                    onChange={setDate}
                    value={date}
                    tileClassName={tileClassName}
                />
                <DiaryEditor
                    value={diaries[dateKey] || ""}
                    onChange={(v) => setDiaries({ ...diaries, [dateKey]: v })}
                    onExpand={() => setIsModalOpen(true)}
                    isToday={isToday(date)}
                    onSaveClick={handleSaveClick}
                    onDelete={() => handleDelete(dateKey)}
                />
            </div>
            {isModalOpen && (
                <DiaryModal
                    value={diaries[dateKey] || ""}
                    onChange={(v) => setDiaries({ ...diaries, [dateKey]: v })}
                    onClose={() => setIsModalOpen(false)}
                    onSaveClick={handleSaveClick}
                    onDelete={() => handleDelete(dateKey)}
                    isToday={isToday(date)}
                />
            )}
            {isConfirmOpen && (
                <ConfirmModal
                    onConfirm={() => {
                        handleSave(dateKey, diaries[dateKey] || "");
                        handleConfirm();
                    }}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
            {isAnalysisOpen && (
                <AnalysisModal
                    result={analysisResult}
                    onClose={() => setIsAnalysisOpen(false)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

export default MainPage;