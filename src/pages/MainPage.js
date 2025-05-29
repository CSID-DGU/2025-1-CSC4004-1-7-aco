import React, { useState, useEffect, useMemo } from "react";
import Navigation from "../components/Navigation";
import Calendar from "../components/Calendar";
import DiaryEditor from "../components/DiaryEditor";
import AnalysisModal from "../components/AnalysisModal";
import DiaryModal from "../components/DiaryModal";
import ConfirmModal from "../components/ConfirmModal";
import styled from "styled-components";
import { createDiary, updateDiary, deleteDiary, getDiariesByDate, saveOrUpdateAnalysis, getAnalysisByDiaryId } from '../services/diaryService';

const MainContent = styled.main`
    width: 100vw;
    max-width: 1600px;
    min-height: 100vh;
    margin: 0 auto;
    margin-top: 90px;
    display: flex;
    gap: 120px;
    justify-content: center;
    align-items: flex-start;
`;

const CalendarWrapper = styled.div`
    width: 540px;
    height: 540px;
    background: #fff;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 32px;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18);
`;

const DiaryArea = styled.div`
    position: relative;
    width: 700px;
    height: 600px;
    background: transparent;
    border-radius: 28px;
    display: flex;
    flex-direction: column;
    margin-top: 12px;
    align-items: flex-end;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18);
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

    // 일기 저장(작성/수정)
    const handleSaveDiary = async () => {
        if (!isTodaySelected) return;
        const diary = diaryMap[dateKey];
        try {
            if (diary && diary.id) {
                await updateDiary(diary.id, diary); // file이 있다면 세 번째 인자에 file 추가
            } else {
                await createDiary(diary); // file이 있다면 두 번째 인자에 file 추가
            }
            alert('저장되었습니다!');
            // 저장 후 다시 불러오기(선택)
            const diaries = await getDiariesByDate(dateKey);
            if (diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: diaries[0] }));
            }
        } catch (e) {
            alert('저장 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    // 일기 삭제
    const confirmDelete = async () => {
        const diary = diaryMap[dateKey];
        if (!diary?.id) return;
        try {
            await deleteDiary(diary.id);
            setDiaryMap((prev) => {
                const newMap = { ...prev };
                delete newMap[dateKey];
                return newMap;
            });
            setShowDeleteConfirm(false);
        } catch (e) {
            alert('삭제 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    // 감정 분석(실제 API 연동)
    const handleAnalyze = async (targetDate) => {
        const currentDateKey = getKSTDateKey(targetDate);
        setIsAnalyzing(true);
        try {
            // 1. 일기 ID 확인
            const diary = diaryMap[currentDateKey];
            if (!diary || !diary.diaryId) {
                alert('해당 날짜에 저장된 일기가 없습니다.');
                setIsAnalyzing(false);
                return;
            }
            // 2. 분석 요청 DTO 예시 (실제 값으로 대체 필요)
            const analysisRequest = {
                emotionRate: 80, // 예시값
                mealCount: 3,   // 예시값
                wakeUpTime: "07:30:00", // 예시값
                wentOutside: true // 예시값
            };
            // 3. 분석 결과 저장/수정 요청
            await saveOrUpdateAnalysis(diary.diaryId, analysisRequest);
            // 4. 분석 결과 조회
            const analysis = await getAnalysisByDiaryId(diary.diaryId);
            setAnalysisResult(analysis);
        } catch (e) {
            alert('분석 실패: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 날짜 선택 시 해당 날짜 일기 불러오기
    const handleSelectDate = async (date) => {
        const newDate = new Date(date);
        const dateKey = getKSTDateKey(newDate);
        setSelectedDate(newDate);
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        try {
            const diaries = await getDiariesByDate(dateKey);
            if (diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: diaries[0] }));
            } else {
                setDiaryMap((prev) => {
                    const newMap = { ...prev };
                    delete newMap[dateKey];
                    return newMap;
                });
            }
        } catch (e) {
            alert('일기 불러오기 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    // 월 변경 핸들러
    const handleChangeMonth = (date) => {
        setCurrentMonth(date);
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
                            onClick={() => setShowDeleteConfirm(true)}
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
                    onDelete={() => setShowDeleteConfirm(true)}
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