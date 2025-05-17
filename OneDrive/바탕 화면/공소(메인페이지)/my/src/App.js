import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DrawingPage from "./pages/DrawingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/drawing" element={<DrawingPage />} />
        {/* 추후 명상, 마이페이지 라우트 추가 */}
      </Routes>
    </Router>
  );
}

export default App;