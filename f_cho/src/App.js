import { Routes, Route, Link } from "react-router-dom";
import './App.css';
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <div>
        <Link to={"/"}>Signin</Link>
        <Link to={"/signup"}>Signup</Link>
      </div>
    </div>
  );
}

export default App;