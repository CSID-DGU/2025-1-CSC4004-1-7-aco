import React, { useState, useEffect, useMemo } from "react";
import Navigation from "../components/Navigation";
import Calendar from "../components/Calendar";
import DiaryEditor from "../components/DiaryEditor";
import AnalysisModal from "../components/AnalysisModal";
import DiaryModal from "../components/DiaryModal";
import ConfirmModal from "../components/ConfirmModal";
import styled from "styled-components";

const MainContent = styled.main`
    width: 100vw;
    max-width: 1400px;
    min-height: 100vh;
    margin: 0 auto;
    margin-top: 120px;
    display: flex;
    gap: 100px;
    justify-content: center;
    align-items: flex-start;
`;

const CalendarWrapper = styled.div`
    width: 502px;
    height: 497px;
    background: #fff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25);
`;

const DiaryArea = styled.div`
    position: relative;
    width: 600px;
    height: 575px;
    background: transparent;
    border-radius: 25px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25);
`;

const AnalyzeButton = styled.button`
    margin-top: 24px;
    padding: 10px 24px;
    border-radius: 20px;
    background: #0089ed;
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 4px 16px 0 rgba(0,0,0,0.18);
    &:hover {
        transform: scale(1.1);
    }
`;

const SaveButton = styled.button`
    margin-top: 24px;
    padding: 10px 24px;
    border-radius: 20px;
    background: #fff;
    color: #222;
    border: 1.5px solid #222;
    font-size: 16px;
    cursor: pointer;
    margin-left: 8px;
    transition: transform 0.2s;
    box-shadow: 0 4px 16px 0 rgba(0,0,0,0.18);
    &:hover {
        transform: scale(1.1);
    }
`;

const DeleteButton = styled.button`
    margin-top: 24px;
    padding: 10px 24px;
    border-radius: 20px;
    background: #fff;
    color: #222;
    border: 1.5px solid #222;
    font-size: 16px;
    cursor: pointer;
    margin-left: 8px;
    transition: transform 0.2s;
    box-shadow: 0 4px 16px 0 rgba(0,0,0,0.18);
    &:hover {
        transform: scale(1.1);
    }
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    width: 100%;
`;

// KST(한국 시간) 기준 날짜 키 생성 함수
function getKSTDateKey(date) {
    const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
}

export default function MainPage() {
    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(today);
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [diaryMap, setDiaryMap] = useState({});
    const [emotionMap, setEmotionMap] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const dateKey = getKSTDateKey(selectedDate);
    const isTodaySelected = getKSTDateKey(selectedDate) === getKSTDateKey(today);

    // 오늘 날짜 자동 선택
    useEffect(() => {
        setSelectedDate(today);
    }, [today]);

    useEffect(() => {
        // body에 스크롤바가 보이지 않도록 설정
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // 일기 작성/수정
    const handleDiaryChange = (value) => {
        if (!isTodaySelected) {
            return;
        }
        setDiaryMap((prev) => ({
            ...prev,
            [dateKey]: value,
        }));
        // 자동 저장 시 사용자에게 알림
        const saveNotification = document.createElement('div');
        saveNotification.textContent = '자동 저장됨';
        saveNotification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            z-index: 1000;
        `;
        document.body.appendChild(saveNotification);
        setTimeout(() => saveNotification.remove(), 2000);
    };

    // 일기 삭제
    const handleDeleteDiary = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setDiaryMap((prev) => {
            const newMap = { ...prev };
            delete newMap[dateKey];
            return newMap;
        });
        setEmotionMap((prev) => {
            const newMap = { ...prev };
            delete newMap[dateKey];
            return newMap;
        });
        setShowDeleteConfirm(false);
    };

    // 감정 분석(더미)
    const handleAnalyze = (targetDate) => {
        const currentDateKey = getKSTDateKey(targetDate);
        setIsAnalyzing(true);
        setTimeout(() => {
            // 예시: 우울=진파랑, 행복=연파랑
            const score = Math.random();
            let color = "happy";
            let emotion = "행복";
            let message = "오늘도 수고했어요!";
            if (score < 0.33) {
                color = "sad";
                emotion = "우울";
                message = "마음이 힘들 땐 쉬어가요.";
            } else if (score < 0.66) {
                color = "normal";
                emotion = "보통";
                message = "평범한 하루도 소중해요.";
            }
            setEmotionMap((prev) => ({
                ...prev,
                [currentDateKey]: color,
            }));
            setAnalysisResult({ emotion, message });
            setIsAnalyzing(false);
        }, 1200);
    };

    // 달력 날짜 클릭 시 해당 날짜 일기 불러오기
    const handleSelectDate = (date) => {
        const newDate = new Date(date);
        const dateKey = getKSTDateKey(newDate);
        
        // 상태 업데이트를 한 번에 처리
        setSelectedDate(newDate);
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        
        // 디버깅 로그
        console.log('Selected date:', newDate);
        console.log('Date key:', dateKey);
        console.log('Diary exists:', !!diaryMap[dateKey]);
    };

    // 월 변경 핸들러
    const handleChangeMonth = (date) => {
        setCurrentMonth(date);
    };

    const handleSaveDiary = () => {
        if (!isTodaySelected) return;
        alert('저장되었습니다!');
    };

    return (
        <div>
            <Navigation />
            <MainContent>
                <CalendarWrapper>
                    <Calendar
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        emotionMap={emotionMap}
                        currentMonth={currentMonth}
                        onChangeMonth={handleChangeMonth}
                    />
                </CalendarWrapper>
                <DiaryArea>
                    <DiaryEditor
                        value={diaryMap[dateKey] || { title: "", text: "", meal: false, outing: false }}
                        onChange={handleDiaryChange}
                        isToday={isTodaySelected}
                        onExpand={() => setIsModalOpen(true)}
                        smallFont={true}
                    />
                    <ButtonContainer>
                        <AnalyzeButton onClick={() => handleAnalyze(selectedDate)} disabled={isAnalyzing}>
                            {isAnalyzing ? "분석 중..." : "일기 분석 확인"}
                        </AnalyzeButton>
                        <SaveButton onClick={handleSaveDiary} disabled={!isTodaySelected}>
                            저장하기
                        </SaveButton>
                        <DeleteButton
                            onClick={handleDeleteDiary}
                            disabled={!diaryMap[dateKey]}
                        >
                            삭제하기
                        </DeleteButton>
                    </ButtonContainer>
                </DiaryArea>
            </MainContent>
            {isModalOpen && (
                <DiaryModal
                    value={diaryMap[dateKey] || { title: "", text: "", meal: false, outing: false }}
                    onChange={handleDiaryChange}
                    onClose={() => setIsModalOpen(false)}
                    isToday={isTodaySelected}
                    onAnalyze={() => handleAnalyze(selectedDate)}
                    isAnalyzing={isAnalyzing}
                    onDelete={handleDeleteDiary}
                    showDelete={!!diaryMap[dateKey]}
                    onSave={handleSaveDiary}
                />
            )}
            {analysisResult && (
                <AnalysisModal result={analysisResult} onClose={() => setAnalysisResult(null)} />
            )}
            {showDeleteConfirm && (
                <ConfirmModal
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    );
}