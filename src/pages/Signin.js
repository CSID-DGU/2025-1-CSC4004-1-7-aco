import './Signin.css';
import Button from "../components/Button";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../api/auth';

const Signin = () => {
    const navigate = useNavigate();

    const [errMsg, setErrMsg] = useState();
    const [state, setState] = useState({
        id: "",
        password: "",
    })

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    const handleLogin = async () => {
        setErrMsg("");

        try {
            const response = await signIn(state.id, state.password);

            console.log("response", response);

            // 로컬에 역할 저장
            localStorage.setItem('role', response.memberType);
            // 이름 저장
                localStorage.setItem('userName', response.name);

            if(response.memberType === "DOCTOR") {
                navigate("/doctor");
            } else {
                navigate("/mainpage");
            }
        }

        catch (error) {
            if (error.response?.data?.message) {
                setErrMsg(error.response.data.message);
            } else {
                setErrMsg("로그인 중 오류가 발생했습니다.");
            }
        }
    }

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

                <div className="inputTitle id">아이디</div>
                <div className="inputWrap">
                    <input name="id" value={state.id} onChange={handleOnChange} className="input" placeholder="아이디를 입력해주세요"></input>
                </div>

                <div className="inputTitle pw">비밀번호</div>
                <div className="inputWrap">
                    <input name="password" value={state.password} onChange={handleOnChange} className="input" type="password" autoComplete='off' placeholder="비밀번호를 입력해주세요"></input>
                </div>

                {/* 에러 메세지 출력 */}
                <div className='signinError'>
                    {errMsg && <span>{errMsg}</span>}
                </div>

                {/* 이메일과 비밀번호 미작성 시 버튼 비활성화 */}
                <div className='btn'>
                    <Button text={"로그인"} onClick={handleLogin} disabled={!state.id || !state.password} />
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