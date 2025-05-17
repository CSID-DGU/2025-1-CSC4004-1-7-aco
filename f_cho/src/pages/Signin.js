import './Signin.css';
import Button from "../component/Button";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { mockLogin } from '../api/authMock';
// import { login } from '../api/auth'; // 나중에 백엔드 연결할 때 이걸로 교체

const Signin = () => {
    const [email, setEmail] = useState();
    const [pw, setPw] = useState();

    const handleSetEmail = (e) => { setEmail(e.target.value); };
    const handleSetPw = (e) => { setPw(e.target.value); };

    const navigate = useNavigate();


    const handleLogin = async () => {
        try {
            const res = await mockLogin({ email, password: pw });
            alert(`${res.data.user.name}님, 환영합니다!`);
            navigate("/"); // 성공 시 이동할 페이지
        } catch (err) {
            alert(err.data.message);
        }
    };


    return (
        <div className='signinPage'>

            {/* 글씨 부분 */}
            <div className="titlewrap">
                <div className="welcome">
                    정신 건강 케어 플랫폼
                </div>
                <div className="signin">
                    로그인
                </div>
                <div className='name'>
                    마음나루
                </div>
            </div>

            {/* 사용자로부터 입력받기 + 버튼 */}
            <div className='contentwrap'>

                <div className="inputTitle id">이메일</div>
                <div className="inputWrap">
                    <input value={email} onChange={handleSetEmail} className="input" placeholder="이메일을 입력해주세요"></input>
                </div>

                <div className="inputTitle pw">비밀번호</div>
                <div className="inputWrap">
                    <input value={pw} onChange={handleSetPw} className="input" placeholder="비밀번호를 입력해주세요"></input>
                </div>

                {/* 이메일과 비밀번호 미작성 시 버튼 비활성화 */}
                <div className='btn'>
                    {/* <Button text={"로그인"} onClick={() => navigate("/")} disabled={!email || !pw} /> */}
                    <Button text={"로그인"} onClick={handleLogin} disabled={!email || !pw} />
                </div>

                {/* 계정 없으면 회원가입 페이지로 이동 */}
                <div className="signup">
                    <span className="text_normal">아직 계정이 없으신가요 ?</span>
                    <span className="text_highlight" onClick={() => navigate("/signup")}>회원가입</span>
                </div>
            </div>
        </div>
    );
};

export default Signin;