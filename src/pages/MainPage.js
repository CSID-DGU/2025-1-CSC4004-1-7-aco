import React, { useState, useEffect, useMemo } from "react";
import Navigation from "../components/Navigation";
import Calendar from "../components/Calendar";
import DiaryEditor from "../components/DiaryEditor";
import AnalysisModal from "../components/AnalysisModal";
import DiaryModal from "../components/DiaryModal";
import ConfirmModal from "../components/ConfirmModal";
import styled from "styled-components";
import { createDiary, updateDiary, deleteDiary, getDiaryByDate, saveOrUpdateAnalysis, getAnalysisByDiaryId } from '../api/diary';

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

// 감정 점수 맵 API 요청 함수
async function fetchEmotionMap(year, month) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/diary/emotion-map?year=${year}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('감정 점수 불러오기 실패');
    return await res.json(); // { '2025-05-01': 0.7, ... }
}

// 감정 점수 → 7단계 색상 매핑 함수
function getEmotionColor(score) {
    if (score === null || score === undefined) return '#eee'; // 점수 없음
    const colors = [
        '#003366', // 찐한 파랑 (매우 우울)
        '#336699',
        '#6699cc',
        '#99ccff',
        '#b3e0ff',
        '#cceeff',
        '#e6f7ff'  // 연한 파랑 (행복)
    ];
    const idx = Math.min(6, Math.max(0, Math.floor(((score + 1) / 2) * 7)));
    return colors[idx];
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAnalyzeConfirm, setShowAnalyzeConfirm] = useState(false);
    const [selectedDiaryId, setSelectedDiaryId] = useState(null);

    const dateKey = getKSTDateKey(selectedDate);
    const isTodaySelected = getKSTDateKey(selectedDate) === getKSTDateKey(today);
    const diary = diaryMap[dateKey];
    const hasDiary = diary && diary.id;
    const isAnalyzed = diary && (diary.analysisId || diary.analysisResult || diary.analysis);
    const canAnalyze = (
        diary &&
        typeof diary.mealCount === 'number' && diary.mealCount > 0 &&
        typeof diary.outing === 'boolean' &&
        diary.title && diary.title.trim() !== '' &&
        diary.text && diary.text.trim() !== ''
    );

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
        setDiaryMap((prev) => ({
            ...prev,
            [dateKey]: {
                ...value,
                createDate: dateKey,
            },
        }));
    };

    // 일기 저장(작성)
    const handleSaveDiary = async () => {
        let diary = diaryMap[dateKey];
        diary = { ...diary, createDate: dateKey };
        try {
            await createDiary(diary);
            alert('저장되었습니다!');
            const diaries = await getDiaryByDate(dateKey);
            if (diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: diaries[0] }));
            }
        } catch (e) {
            alert('저장 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    // 일기 수정(수정 모드에서 저장)
    const handleEditDiary = async () => {
        let diary = diaryMap[dateKey];
        diary = { ...diary, createDate: dateKey };
        try {
            await updateDiary(diary.id, diary);
            alert('수정되었습니다!');
            const diaries = await getDiaryByDate(dateKey);
            if (diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: diaries[0] }));
            }
            setIsEditMode(false);
        } catch (e) {
            alert('수정 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    // 일기 삭제
    const confirmDelete = async () => {
        if (!selectedDiaryId) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/diary/${selectedDiaryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setDiaryMap((prev) => {
                const newMap = { ...prev };
                delete newMap[dateKey];
                return newMap;
            });
            setShowDeleteConfirm(false);
            setSelectedDiaryId(null);
        } catch (e) {
            alert('삭제 실패: ' + (e.response?.data?.message || e.message));
        }
    };

    // 감정 분석(실제 API 연동)
    const handleAnalyze = async (targetDate) => {
        const currentDateKey = getKSTDateKey(targetDate);
        setIsAnalyzing(true);
        try {
            // 분석 전 저장/수정
            let diary = diaryMap[currentDateKey];
            diary = { ...diary, createDate: currentDateKey };
            let savedDiary = diary;
            if (diary && diary.id) {
                savedDiary = await updateDiary(diary.id, diary);
            } else {
                savedDiary = await createDiary(diary);
            }
            const diaries = await getDiaryByDate(currentDateKey);
            if (diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [currentDateKey]: diaries[0] }));
                savedDiary = diaries[0];
            }
            if (!savedDiary || !savedDiary.diaryId) {
                alert('해당 날짜에 저장된 일기가 없습니다.');
                setIsAnalyzing(false);
                return;
            }
            // 분석 요청 DTO 예시
            const analysisRequest = {
                emotionRate: 80,
                mealCount: 3,
                wakeUpTime: "07:30:00",
                wentOutside: true
            };
            await saveOrUpdateAnalysis(savedDiary.diaryId, analysisRequest);
            const analysis = await getAnalysisByDiaryId(savedDiary.diaryId);
            setAnalysisResult(analysis);
            setIsEditMode(false); // 분석 후 수정 불가
        } catch (e) {
            alert('분석 실패: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 날짜 변경
    const handleSelectDate = async (date) => {
        const newDate = new Date(date);
        const dateKey = getKSTDateKey(newDate);
        setSelectedDate(newDate);
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        try {
            // diary는 단일 객체로 온다고 가정
            const diary = await getDiaryByDate(dateKey);
            if (diary && diary.diaryId) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: diary }));
                setSelectedDiaryId(diary.diaryId);
            } else {
                setDiaryMap((prev) => {
                    const newMap = { ...prev };
                    delete newMap[dateKey];
                    return newMap;
                });
                setSelectedDiaryId(null);
            }
        } catch (e) {
            alert('일기 불러오기 실패: ' + (e.response?.data?.message || e.message));
            setSelectedDiaryId(null);
        }
    };

    // 월 변경 핸들러
    const handleChangeMonth = (date) => {
        setCurrentMonth(date);
    };

    // 달 이동/진입 시 emotionMap 요청
    useEffect(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        fetchEmotionMap(year, month).then(setEmotionMap).catch(console.error);
    }, [currentMonth]);

    return (
        <div>
            <Navigation />
            <MainContent>
                <CalendarWrapper>
                    <Calendar
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        emotionMap={emotionMap}
                        getEmotionColor={getEmotionColor}
                        currentMonth={currentMonth}
                        onChangeMonth={handleChangeMonth}
                    />
                </CalendarWrapper>
                <DiaryArea>
                    <DiaryEditor
                        value={diaryMap[dateKey] || { title: "", text: "", mealCount: '', outing: false }}
                        onChange={handleDiaryChange}
                        isToday={!isAnalyzed && (!hasDiary || isEditMode || !diary?.id)}
                        onExpand={() => setIsModalOpen(true)}
                        smallFont={true}
                    />
                    <ButtonContainer>
                        {/* 일기 없음: 저장, 분석 */}
                        {(!hasDiary && !isAnalyzed) && (
                            <>
                                <SaveButton onClick={handleSaveDiary}>저장하기</SaveButton>
                                <span className="analyze-btn-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                    <AnalyzeButton
                                        onClick={() => canAnalyze && !isAnalyzing && setShowAnalyzeConfirm(true)}
                                        disabled={isAnalyzing || !canAnalyze}
                                    >
                                        {isAnalyzing ? "분석 중..." : "일기 분석하기"}
                                    </AnalyzeButton>
                                    {!canAnalyze && (
                                        <span className="analyze-tooltip" style={{
                                            position: 'absolute',
                                            top: '-32px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#222',
                                            color: '#fff',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: 13,
                                            whiteSpace: 'nowrap',
                                            zIndex: 10,
                                            pointerEvents: 'none',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                        }}>
                                            빈칸을 모두 채워주세요
                                        </span>
                                    )}
                                </span>
                            </>
                        )}
                        {/* 일기 있음, 분석 전: 수정, 삭제, 분석 */}
                        {(hasDiary && !isAnalyzed) ? (
                            <>
                                {!isEditMode ? (
                                    <SaveButton onClick={() => setIsEditMode(true)}>수정하기</SaveButton>
                                ) : (
                                    <SaveButton onClick={handleEditDiary}>저장하기</SaveButton>
                                )}
                                <DeleteButton onClick={() => setShowDeleteConfirm(true)}>삭제하기</DeleteButton>
                                <span className="analyze-btn-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                    <AnalyzeButton
                                        onClick={() => canAnalyze && !isAnalyzing && setShowAnalyzeConfirm(true)}
                                        disabled={isAnalyzing || !canAnalyze}
                                    >
                                        {isAnalyzing ? "분석 중..." : "일기 분석하기"}
                                    </AnalyzeButton>
                                    {!canAnalyze && (
                                        <span className="analyze-tooltip" style={{
                                            position: 'absolute',
                                            top: '-32px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: '#222',
                                            color: '#fff',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: 13,
                                            whiteSpace: 'nowrap',
                                            zIndex: 10,
                                            pointerEvents: 'none',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                        }}>
                                            빈칸을 모두 채워주세요
                                        </span>
                                    )}
                                </span>
                            </>
                        ) : null}
                        {/* 분석 완료: 삭제만 */}
                        {hasDiary && isAnalyzed && (
                            <DeleteButton onClick={() => setShowDeleteConfirm(true)}>삭제하기</DeleteButton>
                        )}
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
            {showAnalyzeConfirm && (
                <ConfirmModal
                    message="정말 분석하시겠습니까? 분석 후에는 수정이 불가합니다."
                    onConfirm={async () => {
                        await handleAnalyze(selectedDate);
                        setShowAnalyzeConfirm(false);
                    }}
                    onCancel={() => setShowAnalyzeConfirm(false)}
                />
            )}
            <style>{`
            .analyze-btn-wrapper:hover .analyze-tooltip { opacity: 1 !important; }
            `}</style>
        </div>
    );
}