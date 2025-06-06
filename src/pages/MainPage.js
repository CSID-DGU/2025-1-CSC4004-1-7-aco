import React, { useState, useEffect, useMemo, useCallback } from "react";
import Navigation from "../components/Navigation";
import Calendar from "../components/Calendar";
import DiaryEditor from "../components/DiaryEditor";
import AnalysisModal from "../components/AnalysisModal";
import DiaryModal from "../components/DiaryModal";
import ConfirmModal from "../components/ConfirmModal";
import AnalysisInputModal from '../components/AnalysisInputModal';
import styled from "styled-components";
import { createDiary, updateDiary, deleteDiary, getDiaryByDate, saveOrUpdateAnalysis, getAnalysisByDiaryId, getEmotionRateFromPython } from '../api/diary';
import axios from 'axios';

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
    width: 650px;
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
    // date는 이미 KST 기준임
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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

// diary 객체의 id 필드를 보정하는 함수
function normalizeDiary(diary) {
    if (!diary) return null;
    return {
        ...diary,
        id: diary.diaryId || diary.id,
    };
}

// 쿠키에서 accessToken을 읽는 함수
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export default function MainPage() {
    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(today);
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [diaryMap, setDiaryMap] = useState({});
    const [emotionMap, setEmotionMap] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAnalyzeConfirm, setShowAnalyzeConfirm] = useState(false);
    const [selectedDiaryId, setSelectedDiaryId] = useState(null);

    const dateKey = getKSTDateKey(selectedDate);
    const isTodaySelected = getKSTDateKey(selectedDate) === getKSTDateKey(today);
    const diary = diaryMap[dateKey] || { title: "", text: "", mealCount: '', outing: false };
    const hasDiary = diary && diary.id;
    const isAnalyzed = diary && (diary.analysisId || diary.analysisResult || diary.analysis);
    const canAnalyze = (
        diary &&
        (diary.title ?? '').trim() !== '' &&
        (diary.text ?? '').trim() !== ''
    );

    console.log('diary:', diary);
    console.log('title:', diary.title, typeof diary.title, `"${diary.title}"`);
    console.log('text:', diary.text, typeof diary.text, `"${diary.text}"`);
    console.log('canAnalyze:', canAnalyze);

    // 오늘 날짜 자동 선택 및 오늘 일기 자동 조회
    useEffect(() => {
        setSelectedDate(today);
        const dateKey = getKSTDateKey(today);
        (async () => {
            try {
                const diary = await getDiaryByDate(dateKey);
                if (diary && diary.diaryId) {
                    let text = '';
                    if (diary.contentPath) {
                        try {
                            const res = await axios.get(diary.contentPath, { responseType: 'text' });
                            text = res.data;
                        } catch (e) {
                            console.error('S3에서 파일 읽기 실패:', e);
                        }
                    }
                    setDiaryMap((prev) => ({
                        ...prev,
                        [dateKey]: {
                            ...normalizeDiary(diary),
                            text,
                        }
                    }));
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
                setSelectedDiaryId(null);
            }
        })();
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
            if (Array.isArray(diaries) && diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: normalizeDiary(diaries[0]) }));
            } else if (diaries && diaries.diaryId) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: normalizeDiary(diaries) }));
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
            if (Array.isArray(diaries) && diaries.length > 0) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: normalizeDiary(diaries[0]) }));
            } else if (diaries && diaries.diaryId) {
                setDiaryMap((prev) => ({ ...prev, [dateKey]: normalizeDiary(diaries) }));
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
            await deleteDiary(selectedDiaryId);
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
    const handleAnalyze = async (targetDate, analysisInput) => {
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
            // 파이썬 서버에서 감정점수 받아오기
            const emotionRate = await getEmotionRateFromPython(diary.text);
            // wakeUpTime을 'HH:mm:ss'로 변환
            let wakeUpTimeStr = analysisInput.wakeUpTime;
            if (wakeUpTimeStr && wakeUpTimeStr.length === 5) {
                wakeUpTimeStr += ':00';
            }
            // 분석 요청 DTO (emotionRate 포함)
            const analysisRequest = {
                mealCount: analysisInput.mealCount,
                wentOutside: analysisInput.outing,
                wakeUpTime: wakeUpTimeStr,
                emotionRate
            };
            await saveOrUpdateAnalysis(savedDiary.diaryId, analysisRequest);
        } catch (e) {
            alert('분석 실패: ' + (e.response?.data?.message || e.message));
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 날짜 변경
    const handleSelectDate = useCallback(async (date) => {
        console.log('[handleSelectDate] 전달하는 날짜:', date, 'dateKey:', getKSTDateKey(date));
        const newDate = new Date(date);
        const dateKey = getKSTDateKey(newDate);
        // 콘솔에 날짜 정보 출력
        console.log('[handleSelectDate] 전달하는 날짜:', newDate, 'dateKey:', dateKey);
        setSelectedDate(newDate);
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
        try {
            // diary는 단일 객체로 온다고 가정
            const diary = await getDiaryByDate(dateKey);
            console.log('API 응답 diary:', diary);
            if (diary && diary.contentPath) {
                console.log('API 응답 contentPath:', diary.contentPath);
            }
            // diary가 null/undefined면 diaryMap에서 해당 날짜 값 삭제
            if (!diary) {
                setDiaryMap(prev => {
                    const newMap = { ...prev };
                    delete newMap[dateKey];
                    return newMap;
                });
                setSelectedDiaryId(null);
                return;
            }
            let text = '';
            if (diary && diary.contentPath) {
                try {
                    const res = await axios.get(diary.contentPath, { responseType: 'text' });
                    text = res.data;
                    console.log('S3에서 받아온 텍스트:', res.data);
                } catch (e) {
                    console.error('S3에서 파일 읽기 실패:', e);
                }
            }
            setDiaryMap((prev) => {
                const newMap = {
                    ...prev,
                    [dateKey]: {
                        ...normalizeDiary(diary),
                        text, // S3에서 받아온 텍스트로 덮어씀
                    }
                };
                console.log('setDiaryMap 이후:', newMap[dateKey]);
                return newMap;
            });
            setSelectedDiaryId(diary?.diaryId || null);
        } catch (e) {
            alert('일기 불러오기 실패: ' + (e.response?.data?.message || e.message));
            setSelectedDiaryId(null);
        }
    }, [setDiaryMap, setSelectedDiaryId, setSelectedDate, setCurrentMonth]);

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
                                        onClick={() => setShowAnalyzeConfirm(true)}
                                    >
                                        {isAnalyzing ? "저장 중..." : "최종 저장"}
                                    </AnalyzeButton>
                                </span>
                            </>
                        )}
                        {/* 일기 있음, 분석 전: 수정, 삭제, 분석 */}
                        {(hasDiary && !isAnalyzed) && (
                            <>
                                {!isEditMode ? (
                                    <SaveButton onClick={() => setIsEditMode(true)}>수정하기</SaveButton>
                                ) : (
                                    <SaveButton onClick={handleEditDiary}>저장하기</SaveButton>
                                )}
                                <DeleteButton onClick={() => {
                                    setSelectedDiaryId(diary.id);
                                    setShowDeleteConfirm(true);
                                }}>삭제하기</DeleteButton>
                                <span className="analyze-btn-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                    <AnalyzeButton
                                        onClick={() => setShowAnalyzeConfirm(true)}
                                    >
                                        {isAnalyzing ? "저장 중..." : "최종 저장"}
                                    </AnalyzeButton>
                                </span>
                            </>
                        )}
                        {/* 분석 완료: 삭제만 */}
                        {hasDiary && isAnalyzed && (
                            <DeleteButton onClick={() => {
                                setSelectedDiaryId(diary.id);
                                setShowDeleteConfirm(true);
                            }}>삭제하기</DeleteButton>
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
                    onDelete={() => {
                        setSelectedDiaryId(diary?.id);
                        setShowDeleteConfirm(true);
                    }}
                    showDelete={!!diaryMap[dateKey]}
                    onSave={handleSaveDiary}
                />
            )}
            {showDeleteConfirm && (
                <ConfirmModal
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
            {showAnalyzeConfirm && (
                <AnalysisInputModal
                    open={showAnalyzeConfirm}
                    onCancel={() => setShowAnalyzeConfirm(false)}
                    onConfirm={async (input) => {
                        await handleAnalyze(selectedDate, input);
                        console.log('onConfirm selectedDate:', selectedDate);
                        await handleSelectDate(selectedDate);
                        setShowAnalyzeConfirm(false);
                    }}
                />
            )}
            <style>{`
            .analyze-btn-wrapper:hover .analyze-tooltip { opacity: 1 !important; }
            `}</style>
        </div>
    );
}