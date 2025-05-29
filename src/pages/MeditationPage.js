import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Navigation from '../components/Navigation';
import { getAllMeditations, getMeditationById } from '../api/meditationApi';

const MeditationPageContainer = styled.div`
    width: 100vw;
    min-height: 100vh;
    background: transparent;
    position: relative;
    margin: 0 auto;
    top: -15.9px;
`;

const MainContent = styled.main`
    width: 100vw;
    min-height: calc(100vh - 120px);
    margin: 0 auto;
    margin-top: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
`;

const ContentWrapper = styled.div`
    display: flex;
    gap: 60px;
    width: 100%;
    max-width: 1200px;
`;

const TimerSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const TimerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
`;

const TimerCircle = styled.div`
    width: 240px;
    height: 240px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: transparent;
`;

const TimerText = styled.div`
    font-size: 48px;
    color: #fff;
    font-weight: 500;
    letter-spacing: 2px;
`;

const TimerControls = styled.div`
    display: flex;
    gap: 24px;
    margin-top: 24px;
`;

const TimerBtn = styled.button`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.7);
    color: #0089ed;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;

    &:hover {
        background: rgba(255,255,255,0.9);
        transform: scale(1.1);
    }
`;

const TimeAdjustBtn = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.7);
    color: #222;
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: 0 2px;
    transition: background 0.2s, transform 0.2s;

    &:hover:enabled {
        background: rgba(255,255,255,0.9);
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const MusicSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SearchBar = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    background: rgba(255, 255, 255, 0.9);

    &:focus {
        outline: none;
        border-color: #0089ED;
    }
`;

const SearchButton = styled.button`
    padding: 10px 20px;
    background: #0089ED;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;

    &:hover {
        background: #0073CC;
    }
`;

const MusicList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
    }
`;

const MusicItem = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: translateX(5px);
    }
`;

const MusicInfo = styled.div`
    flex: 1;
`;

const MusicTitle = styled.h4`
    font-size: 16px;
    margin: 0 0 5px 0;
    color: #333;
`;

const MusicDuration = styled.p`
    font-size: 14px;
    margin: 0;
    color: #666;
`;

const PlayButton = styled.button`
    background: #0089ED;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;

    &:hover {
        background: #0073CC;
    }
`;

// 타이머 기본값(초)
const INIT_TIME = 60;

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

const MeditationPage = () => {
    const [meditations, setMeditations] = useState([]);
    const [filteredMeditations, setFilteredMeditations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMeditation, setSelectedMeditation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 타이머 관련 상태
    const [time, setTime] = useState(INIT_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [maxTime, setMaxTime] = useState(INIT_TIME);
    const timerRef = useRef();

    useEffect(() => {
        fetchMeditations();
    }, []);

    // 타이머 관련 useEffect
    useEffect(() => {
        if (!isRunning) return;
        timerRef.current = setInterval(() => {
            setTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    useEffect(() => {
        if (!isRunning) setMaxTime(time);
    }, [time, isRunning]);

    const fetchMeditations = async () => {
        try {
            setIsLoading(true);
            const data = await getAllMeditations();
            setMeditations(data);
            setFilteredMeditations(data);
            setError(null);
        } catch (e) {
            setError('명상 목록을 불러오는데 실패했습니다.');
            console.error('명상 목록 조회 실패:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        const filtered = meditations.filter(meditation =>
            meditation.meditationTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMeditations(filtered);
    };

    const handleMeditationClick = async (meditationId) => {
        try {
            const meditation = await getMeditationById(meditationId);
            setSelectedMeditation(meditation);
            // 선택된 명상의 시간으로 타이머 설정
            setTime(meditation.durationTime);
            setMaxTime(meditation.durationTime);
            setIsRunning(false);
        } catch (e) {
            alert('명상 정보를 불러오는데 실패했습니다.');
            console.error('명상 조회 실패:', e);
        }
    };

    // 타이머 컨트롤 함수들
    const handleIncrease = () => {
        if (isRunning) return;
        setTime(prev => {
            const next = Math.min(prev + 10, 1800);
            setMaxTime(next);
            return next;
        });
    };

    const handleDecrease = () => {
        if (isRunning) return;
        setTime(prev => {
            const next = Math.max(prev - 10, 10);
            setMaxTime(next);
            return next;
        });
    };

    const handleStart = () => {
        if (time === 0) setTime(INIT_TIME);
        setIsRunning(true);
    };

    const handlePause = () => setIsRunning(false);

    const handleReset = () => {
        setIsRunning(false);
        setTime(INIT_TIME);
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes}분`;
    };

    // 원형 게이지 관련 상수
    const RADIUS = 116;
    const CIRCUM = 2 * Math.PI * RADIUS;
    const percent = Math.max(0, time / maxTime);
    const offset = CIRCUM * (1 - percent);

    if (isLoading) {
        return (
            <MeditationPageContainer>
                <Navigation />
                <MainContent>
                    <div>로딩 중...</div>
                </MainContent>
            </MeditationPageContainer>
        );
    }

    return (
        <MeditationPageContainer>
            <Navigation />
            <MainContent>
                {error && (
                    <div style={{ color: 'red', marginBottom: 20 }}>{error}</div>
                )}
                <ContentWrapper>
                    <TimerSection>
                        <TimerWrapper>
                            <TimerCircle>
                                <svg width="240" height="240" style={{ position: 'absolute', top: 0, left: 0 }}>
                                    <circle
                                        cx="120"
                                        cy="120"
                                        r={RADIUS}
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="8"
                                        strokeDasharray={CIRCUM}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.5s linear', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                                    />
                                </svg>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
                                    <TimeAdjustBtn onClick={handleIncrease} disabled={isRunning || time >= 1800}>+</TimeAdjustBtn>
                                    <TimerText>{formatTime(time)}</TimerText>
                                    <TimeAdjustBtn onClick={handleDecrease} disabled={isRunning || time <= 10}>-</TimeAdjustBtn>
                                </div>
                            </TimerCircle>
                            <TimerControls>
                                <TimerBtn onClick={handleStart} title="시작">
                                    <img src="/play-button.png" alt="재생" style={{ width: 28, height: 28 }} />
                                </TimerBtn>
                                <TimerBtn onClick={handlePause} title="일시정지">
                                    <img src="/pause-button.png" alt="일시정지" style={{ width: 28, height: 28 }} />
                                </TimerBtn>
                                <TimerBtn onClick={handleReset} title="정지">
                                    <img src="/stop-button.png" alt="정지" style={{ width: 28, height: 28 }} />
                                </TimerBtn>
                            </TimerControls>
                        </TimerWrapper>
                    </TimerSection>
                    <MusicSection>
                        <SearchBar>
                            <SearchInput
                                type="text"
                                placeholder="명상 제목을 검색하세요"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <SearchButton onClick={handleSearch}>검색</SearchButton>
                        </SearchBar>
                        <MusicList>
                            {filteredMeditations.map((meditation) => (
                                <MusicItem
                                    key={meditation.meditationId}
                                    onClick={() => handleMeditationClick(meditation.meditationId)}
                                >
                                    <MusicInfo>
                                        <MusicTitle>{meditation.meditationTitle}</MusicTitle>
                                        <MusicDuration>소요 시간: {formatDuration(meditation.durationTime)}</MusicDuration>
                                    </MusicInfo>
                                    <PlayButton>재생</PlayButton>
                                </MusicItem>
                            ))}
                        </MusicList>
                    </MusicSection>
                </ContentWrapper>
            </MainContent>
        </MeditationPageContainer>
    );
};

export default MeditationPage;
