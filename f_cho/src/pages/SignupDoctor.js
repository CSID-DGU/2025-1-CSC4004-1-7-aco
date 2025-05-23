import "./SignupDoctor.css";
import Button from "../component/Button";
import Input from "../component/Input";
import attach_file from "../img/attach-file.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupDoctor = () => {
    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [state, setState] = useState({
        name: "",
        email: "",
        id: "",
        password: "",
        confirmPw: "",
        phone: "",
        birthDate: "",
        gender: "",
        hospital: "",
        certification: "", // file name or File object
        licenseNumber: "",
    });

    // 에러 관련
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [birthDateError, setBirthDateError] = useState(false);

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setState({ ...state, certification: file });
        }
    };

    // 이메일 형식 확인
    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 생년월일 형식 확인
    const isBirthDateValid = (birthDate) => {
        const birthRegex = /^\d{4}-\d{2}-\d{2}$/;
        return birthRegex.test(birthDate);
    };

    const handleSignupDoctor = () => {
        const emailValid = isEmailValid(state.email);
        const birthValid = isBirthDateValid(state.birth);

        // 우선순위: 이메일 → 생년월일
        if (!emailValid) {
            setError("올바른 이메일 형식을 입력해주세요.");
            setEmailError(true);
            setBirthDateError(false);
            return;
        }

        if (!birthValid) {
            setError("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
            setEmailError(false);
            setBirthDateError(true);
            return;
        }

        // 모두 유효한 경우
        setError("");
        setEmailError(false);
        setBirthDateError(false);

        navigate("/signup/finish");
    };

    return (
        <div className="signupdoctor">
            <div className="titledp">
                <div className="welcomedp">의사선생님, 환영합니다!</div>
                <div className="signupdp">회원가입</div>
            </div>

            <div className="formgriddp">
                <div className="formcolumndp">
                    <div className="row">
                        <Input name="name" label={"이름"} placeholder={"이름을 입력해주세요"} value={state.name} onChange={handleOnChange} />
                        <div className="gender-row-dp">
                            <div className="gender-label-dp">성별</div>
                            <div className="gender-buttons-dp">
                                <Button text={"남자"} type={"man"} onClick={() => setRole("man")} isSelected={role === "man"} />
                                <Button text={"여자"} type={"woman"} onClick={() => setRole("woman")} isSelected={role === "woman"} />
                            </div>
                        </div>
                    </div>

                    <Input name="email" label={"이메일"} placeholder={"이메일을 입력해주세요"} value={state.email} onChange={handleOnChange} isError={emailError} />
                    <Input name="id" label={"아이디"} placeholder={"아이디를 입력해주세요"} value={state.id} onChange={handleOnChange} />
                    <Input name="password" label={"비밀번호"} placeholder={"비밀번호를 입력해주세요"} value={state.pw} onChange={handleOnChange} type="password" />
                    <Input name="confirmPw" label={"비밀번호 확인"} placeholder={"비밀번호를 다시 입력해주세요"} value={state.confirmPw} onChange={handleOnChange} type="password" />
                </div>

                <div className="formcolumndp">
                    <Input name="birth" label={"생년월일"} placeholder={"YYYY-MM-DD"} value={state.birth} onChange={handleOnChange} isError={birthDateError} />
                    <Input name="phone" label={"연락처"} placeholder={"연락처를 입력해주세요"} value={state.phone} onChange={handleOnChange} />

                    <Input name="hospital" label={"근무 병원"} placeholder={"현재 근무 중인 병원을 입력해주세요"} value={state.hospital} onChange={handleOnChange} />
                    <div className="input-wrapper">
                        <label className="input-label">파일 선택</label>
                        <label htmlFor="certificate-upload" className="file-upload-label">
                            <span className="placeholder-text">{state.certification ? state.certification.name : "의사 면허증을 첨부해주세요"}</span>
                            <input type="file" id="certificate-upload" name="certificate" onChange={handleFileChange} hidden />
                            <img src={attach_file} alt="파일 첨부" className="upload-icon" />
                        </label>
                    </div>
                    <Input name="licenseNumber" label={"의사 면허 번호"} placeholder={"의사 면허 번호를 입력해주세요"} value={state.licenseNumber} onChange={handleOnChange} />

                </div>
            </div>

            <div className="signupDoctorError">
                {error && <span className="error-text">{error}</span>}
            </div>

            <div className="signupbtndt">
                <Button text={"회원가입"} size="large" onClick={handleSignupDoctor} />
            </div>
        </div>
    );
};

export default SignupDoctor;
