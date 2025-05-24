import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import SignIn from "./pages/Signin";
import SignupChoice from "./pages/SignupChoice";
import SignupDoctor from "./pages/SignupDoctor";
import SignupPatient from "./pages/SignupPatient";
import SignupFinish from "./pages/SignupFinish";
import MypageDoctor from "./pages/MypageDoctor";
import MypagePatient from "./pages/MypagePatient";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignupChoice />} />
        <Route path="/signup/doctor" element={<SignupDoctor />} />
        <Route path="/signup/patient" element={<SignupPatient />} />
        <Route path="/signup/finish" element={<SignupFinish />} />
        <Route path="/mypage/doctor" element={<MypageDoctor />} />
        <Route path="/mypage/patient" element={<MypagePatient />} />
      </Routes>
    </div>
  );
}

export default App;