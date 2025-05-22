import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DrawingPage from "./pages/DrawingPage";
import MeditationPage from './pages/MeditationPage';
import DoctorPage from './pages/DoctorPage';

const BACKGROUND_VIDEO = {
  src: "/Untitled 1.mp4",
  type: "video/mp4",
  fallbackMessage: "브라우저가 비디오 태그를 지원하지 않습니다."
};

function AppContent() {
  const location = useLocation();
  const isDoctorPage = location.pathname.startsWith('/doctor');
  return (
    <>
      {!isDoctorPage && (
        <video
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
          <source src={BACKGROUND_VIDEO.src} type={BACKGROUND_VIDEO.type} />
          {BACKGROUND_VIDEO.fallbackMessage}
        </video>
      )}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/drawing" element={<DrawingPage />} />
        <Route path="/meditation" element={<MeditationPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
        {/* 추후 명상, 마이페이지 라우트 추가 */}
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