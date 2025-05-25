import "./SignupDoctor.css";
import Button from "../components/Button";
import Input from "../components/Input";
import attach_file from "../img/attach-file.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpDoctor } from "../api/auth";

const SignupDoctor = () => {
    const navigate = useNavigate();

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
        certification: null,
        licenseNumber: "",
    });

    // 에러 관련
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({
        name: false,
        email: false,
        id: false,
        password: false,
        confirmPw: false,
        phone: false,
        birthDate: false,
        gender: false,
        hospital: false,
        certification: false,
        licenseNumber: false
    });

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
        // 입력이 있으면 해당 필드의 에러 상태를 false로 설정
        if (e.target.value) {
            setErrors(prev => ({
                ...prev,
                [e.target.name]: false
            }));
        }
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
        if (!birthRegex.test(birthDate)) return false;

        const [year, month, day] = birthDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();

        // 유효한 날짜인지 확인
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return false;
        }

        // 미래 날짜인지 확인
        if (date > today) {
            return false;
        }

        // 1900년 이후 출생인지 확인
        if (year < 1900) {
            return false;
        }

        return true;
    };

    const handleBirthDateChange = (e) => {
        const { value } = e.target;
        setState(prev => ({
            ...prev,
            birthDate: value
        }));

        if (value && !isBirthDateValid(value)) {
            setErrors(prev => ({
                ...prev,
                birthDate: true
            }));
            if (value.length === 10) {  // YYYY-MM-DD 형식이 완성되었을 때만 구체적인 에러 메시지 표시
                const [year, month, day] = value.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                const today = new Date();

                if (date > today) {
                    setError("미래 날짜는 입력할 수 없습니다.");
                } else if (year < 1900) {
                    setError("1900년 이후 출생일을 입력해주세요.");
                } else {
                    setError("올바른 생년월일 형식(YYYY-MM-DD)으로 입력해주세요.");
                }
            } else {
                setError("올바른 생년월일 형식(YYYY-MM-DD)으로 입력해주세요.");
            }
        } else {
            setErrors(prev => ({
                ...prev,
                birthDate: false
            }));
            setError("");
        }
    };

    // 회원가입 버튼 클릭 시
    const handleSignUpDoctor = async () => {
        // 에러 상태 초기화
        setError("");
        
        // 각 필드의 유효성 검사를 위한 새로운 에러 상태
        const newErrors = {
            name: !state.name,
            email: !state.email,
            id: !state.id,
            password: !state.password,
            confirmPw: !state.confirmPw,
            phone: !state.phone,
            birthDate: !state.birthDate,
            gender: !state.gender,
            hospital: !state.hospital,
            certification: !state.certification,
            licenseNumber: !state.licenseNumber
        };

        // 빈 필드가 있는지 확인
        const hasEmptyField = Object.values(newErrors).some(error => error);
        
        if (hasEmptyField) {
            setErrors(newErrors);
            setError("모든 항목을 입력해주세요.");
            return;
        }

        // 이메일 형식 검사
        if (!isEmailValid(state.email)) {
            setErrors(prev => ({...prev, email: true}));
            setError("올바른 이메일 형식을 입력해주세요.");
            return;
        }

        // 비밀번호 일치 확인
        if (state.password !== state.confirmPw) {
            setErrors(prev => ({...prev, confirmPw: true}));
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 생년월일 형식 확인
        if (!isBirthDateValid(state.birthDate)) {
            setErrors(prev => ({...prev, birthDate: true}));
            setError("생년월일은 YYYY-MM-DD 형식으로 입력해주세요.");
            return;
        }

        // 모두 유효한 경우
        setError("");
        setErrors({
            name: false,
            email: false,
            id: false,
            password: false,
            confirmPw: false,
            phone: false,
            birthDate: false,
            gender: false,
            hospital: false,
            certification: false,
            licenseNumber: false
        });

        // 유효성 검사 후 API 호출
        const formData = new FormData();
        formData.append("name", state.name);
        formData.append("loginId", state.id);
        formData.append("password", state.password);
        formData.append("email", state.email);
        formData.append("phone", state.phone);
        formData.append("memberType", "DOCTOR");
        formData.append("birthDate", state.birthDate);
        formData.append("gender", state.gender);
        formData.append("hospital", state.hospital);
        formData.append("licenseNumber", state.licenseNumber);
        formData.append("certificationFile", state.certification);

        try {
            const response = await signUpDoctor(formData);
            console.log(response);
            navigate("/signup/finish");
        } catch (error) {
            console.error("의사 회원가입 실패:", error);
        }
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
                        <Input name="name" label={"이름"} placeholder={"이름을 입력해주세요"} 
                            value={state.name} onChange={handleOnChange} isError={errors.name} />
                        <div className="gender-row-dp">
                            <div className="gender-label-dp">성별</div>
                            <div className="gender-buttons-dp">
                                <Button 
                                    text={"남자"} 
                                    type={"MALE"} 
                                    onClick={() => {
                                        setState(prev => ({...prev, gender:"MALE"}));
                                        if (errors.gender) {
                                            setErrors(prev => ({...prev, gender: false}));
                                            setError("");
                                        }
                                    }} 
                                    isSelected={state.gender === "MALE"}
                                    className={errors.gender ? "Button_error" : ""} />
                                <Button 
                                    text={"여자"} 
                                    type={"FEMALE"} 
                                    onClick={() => {
                                        setState(prev => ({...prev, gender:"FEMALE"}));
                                        if (errors.gender) {
                                            setErrors(prev => ({...prev, gender: false}));
                                            setError("");
                                        }
                                    }} 
                                    isSelected={state.gender === "FEMALE"}
                                    className={errors.gender ? "Button_error" : ""} />
                            </div>
                        </div>
                    </div>

                    <Input name="email" label={"이메일"} placeholder={"이메일을 입력해주세요"} 
                        value={state.email} onChange={handleOnChange} isError={errors.email} />
                    <Input name="id" label={"아이디"} placeholder={"아이디를 입력해주세요"} 
                        value={state.id} onChange={handleOnChange} isError={errors.id} />
                    <Input name="password" label={"비밀번호"} placeholder={"비밀번호를 입력해주세요"} 
                        value={state.password} onChange={handleOnChange} type="password" isError={errors.password} />
                    <Input name="confirmPw" label={"비밀번호 확인"} placeholder={"비밀번호를 다시 입력해주세요"} 
                        value={state.confirmPw} onChange={handleOnChange} type="password" isError={errors.confirmPw} />
                </div>

                <div className="formcolumndp">
                    <Input name="birthDate" label={"생년월일"} placeholder={"YYYY-MM-DD"} 
                        value={state.birthDate} onChange={handleBirthDateChange} isError={errors.birthDate} />
                    <Input name="phone" label={"연락처"} placeholder={"01000000000"} 
                        value={state.phone} onChange={handleOnChange} isError={errors.phone} />
                    <Input name="hospital" label={"근무 병원"} placeholder={"현재 근무 중인 병원을 입력해주세요"} 
                        value={state.hospital} onChange={handleOnChange} isError={errors.hospital} />
                    <div className="input-wrapper">
                        <label className="input-label">파일 선택</label>
                        <label htmlFor="certificate-upload" className={`file-upload-label ${errors.certification ? 'input-error' : ''}`}>
                            <span className="placeholder-text">{state.certification ? state.certification.name : "의사 면허증을 첨부해주세요"}</span>
                            <input type="file" id="certificate-upload" name="certificate" onChange={handleFileChange} hidden />
                            <img src={attach_file} alt="파일 첨부" className="upload-icon" />
                        </label>
                    </div>
                    <Input name="licenseNumber" label={"의사 면허 번호"} placeholder={"의사 면허 번호를 입력해주세요"} 
                        value={state.licenseNumber} onChange={handleOnChange} isError={errors.licenseNumber} />
                </div>
            </div>

            <div className="signupDoctorError">
                {error && <span className="error-text">{error}</span>}
            </div>

            <div className="signupbtndt">
                <Button text={"회원가입"} size="large" onClick={handleSignUpDoctor} />
            </div>
        </div>
    );
};

export default SignupDoctor;
