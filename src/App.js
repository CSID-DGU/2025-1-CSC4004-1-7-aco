import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DrawingPage from "./pages/DrawingPage";
import MeditationPage from './pages/MeditationPage';
import DoctorPage from './pages/DoctorPage';
import SignIn from "./pages/Signin";
import SignupChoice from "./pages/SignupChoice";
import SignupDoctor from "./pages/SignupDoctor";
import SignupPatient from "./pages/SignupPatient";
import SignupFinish from "./pages/SignupFinish";
import MypageDoctor from "./pages/MypageDoctor";
import MypagePatient from "./pages/MypagePatient";
import styled from 'styled-components';


const BACKGROUND_VIDEOS = [
  {
    id: 'default',
    src: "/Untitled 1.mp4",
    type: "video/mp4",
    name: "기본 배경",
    thumbnail: "/Untitled 1.jpg"
  },
  {
    id: 'aurora',
    src: "/Aurora.mp4",
    type: "video/mp4",
    name: "오로라",
    thumbnail: "/Aurora.jpg"
  },
  {
    id: 'autumn',
    src: "/Autumn.mp4",
    type: "video/mp4",
    name: "가을",
    thumbnail: "/Autumn.jpg"
  }
];

const BackgroundSelector = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  background: transparent;
  padding: 15px;
  border-radius: 12px;
  box-shadow: none;
  display: flex;
  gap: 10px;
`;

const ThumbnailButton = styled.button`
  width: 80px;
  height: 45px;
  border: 2px solid ${props => props.$isSelected ? '#0089ED' : 'transparent'};
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  background: none;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

function AppContent() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  const isNoBgPage =
    path.startsWith('/doctor') ||
    path.startsWith('/login') ||
    path.startsWith('/signin') ||
    path.startsWith('/signup') ||
    path.startsWith('/mypage/doctor') ||
    path.startsWith('/mypage/patient');

  const [selectedBackground, setSelectedBackground] = useState('default');
  const currentBackground = BACKGROUND_VIDEOS.find(video => video.id === selectedBackground);

  return (
    <>
      {!isNoBgPage && (
        <>
          <video
            key={currentBackground.id}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              zIndex: -1,
            }}
          >
            <source src={currentBackground.src} type={currentBackground.type} />
            브라우저가 비디오 태그를 지원하지 않습니다.
          </video>
          <BackgroundSelector>
            {BACKGROUND_VIDEOS.map(video => (
              <ThumbnailButton
                key={video.id}
                $isSelected={selectedBackground === video.id}
                onClick={() => setSelectedBackground(video.id)}
                title={video.name}
              >
                <img src={video.thumbnail} alt={video.name} />
              </ThumbnailButton>
            ))}
          </BackgroundSelector>
        </>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/drawing" element={<DrawingPage />} />
        <Route path="/meditation" element={<MeditationPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignupChoice />} />
        <Route path="/signup/doctor" element={<SignupDoctor />} />
        <Route path="/signup/patient" element={<SignupPatient />} />
        <Route path="/signup/finish" element={<SignupFinish />} />
        <Route path="/mypage/doctor" element={<MypageDoctor />} />
        <Route path="/mypage/patient" element={<MypagePatient />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;