import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Navigation from '../components/Navigation';

// 음악 리스트 더미 데이터
const musicList = [
    {
        title: 'current favorites',
        count: 20,
        img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=80&h=80',
    },
    {
        title: '3:00am vibes',
        count: 18,
        img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=80&h=80',
    },
    {
        title: 'Lofi Loft',
        count: 43,
        img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=80&h=80',
    },
    {
        title: 'rain on my window',
        count: 32,
        img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=facearea&w=80&h=80',
    },
    {
        title: 'Anime OSTs',
        count: 20,
        img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=80&h=80',
    },
];

const PageWrapper = styled.div`
  min-height: 100vh;
  background: transparent;
`;

const MainContent = styled.main`
    width: 100vw;
    max-width: 1600px;
    min-height: 100vh;
    margin: 0 auto;
    margin-top: 120px;
    display: flex;
    gap: 60px;
    justify-content: center;
    align-items: flex-start;
`;

const LeftSection = styled.div`
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
  margin-top: 100px;
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

const RightSection = styled.div`
  width: 340px;
  background: transparent;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-height: 520px;
  overflow-y: auto;
  position: relative;
  left: -300px;
  top:50px;
`;

const MusicListTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-left: 32px;
  margin-bottom: 18px;
  color: #fff;
`;

const MusicList = styled.ul`
  list-style: none;
  padding: 0 0 0 0;
  margin: 0;
  width: 100%;
`;

const MusicItem = styled.li`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 32px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(245,250,255,0.5);
    border-radius:12px;
  }
`;

const MusicThumb = styled.img`
  width: 54px;
  height: 54px;
  border-radius: 12px;
  object-fit: cover;
`;

const MusicInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MusicTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
`;

const MusicCount = styled.div`
  font-size: 13px;
  color: #fff;
`;

// 타이머 기본값(초)
const INIT_TIME = 60;

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
}

// 추가: 시간 조절 버튼 스타일
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

export default function MeditationPage() {
    const [time, setTime] = useState(INIT_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [maxTime, setMaxTime] = useState(INIT_TIME); // 게이지 계산용
    const timerRef = useRef();

    // 시간 조절 함수
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

    React.useEffect(() => {
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

    // time이 바뀔 때마다 maxTime도 동기화(최초 진입/리셋 등)
    useEffect(() => {
        if (!isRunning) setMaxTime(time);
    }, [time, isRunning]);

    const handleStart = () => {
        if (time === 0) setTime(INIT_TIME);
        setIsRunning(true);
    };
    const handlePause = () => setIsRunning(false);
    const handleReset = () => {
        setIsRunning(false);
        setTime(INIT_TIME);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // 원형 게이지 관련 상수
    const RADIUS = 116; // 240/2 - 8/2 (strokeWidth)
    const CIRCUM = 2 * Math.PI * RADIUS;
    const percent = Math.max(0, time / maxTime);
    const offset = CIRCUM * (1 - percent);

    return (
        <PageWrapper>
            <Navigation />
            <MainContent>
                <LeftSection>
                    <TimerWrapper>
                        <TimerCircle>
                            <svg width="240" height="240" style={{ position: 'absolute', top: 0, left: 0 }}>
                                {/* 파란색 진행 게이지만 표시, 12시 방향에서 시작하도록 회전 */}
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
                </LeftSection>
                <RightSection>
                    <MusicListTitle>플레이리스트</MusicListTitle>
                    <MusicList>
                        {musicList.map((music, idx) => (
                            <MusicItem key={idx}>
                                <MusicThumb src={music.img} alt={music.title} />
                                <MusicInfo>
                                    <MusicTitle>{music.title}</MusicTitle>
                                    <MusicCount>{music.count} songs</MusicCount>
                                </MusicInfo>
                            </MusicItem>
                        ))}
                    </MusicList>
                </RightSection>
            </MainContent>
        </PageWrapper>
    );
}
