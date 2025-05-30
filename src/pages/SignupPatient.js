import "./SignupPatient.css";
import Button from "../components/Button";
import Input from "../components/Input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpPatient } from "../api/auth";

const SignupPatient = () => {
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [errors, setErrors] = useState({
        name: false,
        gender: false,
        phone: false,
        email: false,
        id: false,
        password: false,
        confirmPw: false,
        birthDate: false,
        address: false,
        hospital: false,
        workspace: false
    });

    const [state, setState] = useState({
        name: "",
        id: "",
        password: "",
        confirmPw: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        hospital: "",
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
        const dateObj = new Date(year, month - 1, day);
        const today = new Date();

        // 유효한 날짜인지 확인
        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
            return false;
        }

        // 미래 날짜인지 확인
        if (dateObj > today) {
            return false;
        }

        // 1900년 이후 출생인지 확인
        if (year < 1900) {
            return false;
        }

        return true;
    };

    const handleEmailChange = (e) => {
        const { value } = e.target;
        setState(prev => ({
            ...prev,
            email: value
        }));

        if (value && !isEmailValid(value)) {
            setErrors(prev => ({
                ...prev,
                email: true
            }));
            setError("올바른 이메일 형식을 입력해주세요.");
        } else {
            setErrors(prev => ({
                ...prev,
                email: false
            }));
            setError("");
        }
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
            setError("올바른 생년월일 형식(YYYY-MM-DD)으로 입력해주세요.");
        } else {
            setErrors(prev => ({
                ...prev,
                birthDate: false
            }));
            setError("");
        }
    };

    const handleSignUpPatient = async () => {
        // 에러 상태 초기화
        setError("");
        
        // 1. 빈 필드 검사
        const newErrors = {
            name: !state.name,
            gender: !state.gender,
            phone: !state.phone,
            email: !state.email,
            id: !state.id,
            password: !state.password,
            confirmPw: !state.confirmPw,
            birthDate: !state.birthDate,
            hospital: !state.hospital
        };

        const hasEmptyField = Object.values(newErrors).some(error => error);
        
        if (hasEmptyField) {
            setErrors(newErrors);
            setError("모든 항목을 입력해주세요.");
            return;
        }

        // 2. 이메일 형식 검사
        if (!isEmailValid(state.email)) {
            setErrors(prev => ({
                ...prev,
                email: true
            }));
            setError("올바른 이메일 형식을 입력해주세요.");
            return;
        }

        // 3. 비밀번호 일치 검사
        if (state.password !== state.confirmPw) {
            setErrors(prev => ({
                ...prev,
                confirmPw: true
            }));
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 4. 생년월일 형식 검사
        if (!isBirthDateValid(state.birthDate)) {
            setErrors(prev => ({
                ...prev,
                birthDate: true
            }));
            if (state.birthDate.length === 10) {  // YYYY-MM-DD 형식이 완성되었을 때만 구체적인 에러 메시지 표시
                const [year, month, day] = state.birthDate.split('-').map(Number);
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
            return;
        }

        // 모든 유효성 검사 통과
        setError("");
        setErrors({
            name: false,
            gender: false,
            phone: false,
            email: false,
            id: false,
            password: false,
            confirmPw: false,
            birthDate: false,
            hospital: false
        });

        // 유효성 검사 후 API 호출
        const formData = new FormData();
        formData.append("name", state.name);
        formData.append("loginId", state.id);
        formData.append("password", state.password);
        formData.append("email", state.email);
        formData.append("phone", state.phone);
        formData.append("birthDate", state.birthDate);
        formData.append("gender", state.gender);
        formData.append("memberType", "PATIENT");        
        formData.append("hospital", state.hospital);

        console.log([...formData.entries()]);


        try {
            const response = await signUpPatient(formData);
            console.log(response);
            navigate("/signup/finish");
        } catch (error) {
            console.error("환자 회원가입 실패:", error);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setState(prev => ({
            ...prev,
            [name]: value
        }));
        
        // 비밀번호 입력 시 에러 상태 초기화
        setErrors(prev => ({
            ...prev,
            [name]: false
        }));

        // 비밀번호 확인 필드가 비어있지 않은 경우, 일치 여부 확인
        if (name === 'password' && state.confirmPw) {
            if (value !== state.confirmPw) {
                setErrors(prev => ({
                    ...prev,
                    confirmPw: true
                }));
                setError("비밀번호가 일치하지 않습니다.");
            } else {
                setErrors(prev => ({
                    ...prev,
                    confirmPw: false
                }));
                setError("");
            }
        }
        
        if (name === 'confirmPw' && value) {
            if (value !== state.password) {
                setErrors(prev => ({
                    ...prev,
                    confirmPw: true
                }));
                setError("비밀번호가 일치하지 않습니다.");
            } else {
                setErrors(prev => ({
                    ...prev,
                    confirmPw: false
                }));
                setError("");
            }
        }
    };

    return (
        <div className="signuppatient">
            <div className="titlepp">
                <div className="welcomepp">
                    소중한 환자분, 환영합니다!
                </div>
                <div className="signuppp">
                    회원가입
                </div>
            </div>

            <div className="formgridpp">
                <div className="formcolumnpp">
                    <div className="row">
                        <Input name="name" label={"이름"} placeholder={"이름을 입력해주세요"} 
                            value={state.name} onChange={handleOnChange} isError={errors.name} />
                        
                        <div className="gender-row-pp">
                            <div className="gender-label-pp">성별</div>
                            <div className="gender-buttons-pp">
                                <Button 
                                    text={"남자"} 
                                    type={"MALE"} 
                                    onClick={() => {
                                        setState(prev => ({ ...prev, gender: "MALE" }));
                                        if (errors.gender) {
                                            setErrors(prev => ({ ...prev, gender: false }));
                                            setError("");
                                        }
                                    }} 
                                    isSelected={state.gender === "MALE"}
                                    className={errors.gender ? "Button_error" : ""} />
                                <Button 
                                    text={"여자"} 
                                    type={"FEMALE"} 
                                    onClick={() => {
                                        setState(prev => ({ ...prev, gender: "FEMALE" }));
                                        if (errors.gender) {
                                            setErrors(prev => ({ ...prev, gender: false }));
                                            setError("");
                                        }
                                    }}
                                    isSelected={state.gender === "FEMALE"}
                                    className={errors.gender ? "Button_error" : ""} />
                            </div>
                        </div>
                    </div>

                    <Input name="id" label={"아이디"} placeholder={"아이디를 입력해주세요"}
                        value={state.id} onChange={handleOnChange} isError={errors.id} />
                    <Input name="password" label={"비밀번호"} placeholder={"비밀번호를 입력해주세요"}
                        value={state.password} onChange={handlePasswordChange} type="password" isError={errors.password} />
                    <Input name="confirmPw" label={"비밀번호 확인"} placeholder={"비밀번호를 다시 입력해주세요"}
                        value={state.confirmPw} onChange={handlePasswordChange} type="password" isError={errors.confirmPw} />
                </div>

                <div className="formcolumnpp">
                    <Input name="email" label={"이메일"} placeholder={"이메일을 입력해주세요"}
                        value={state.email} onChange={handleEmailChange} isError={errors.email} />
                    <Input name="birthDate" label={"생년월일"} placeholder={"YYYY-MM-DD"}
                        value={state.birthDate} onChange={handleBirthDateChange} isError={errors.birthDate} />
                    <Input name="phone" label={"연락처"} placeholder={"01000000000"}
                        value={state.phone} onChange={handleOnChange} isError={errors.phone} />
                    <Input name="hospital" label={"병원"} placeholder={"진료받는 병원을 입력해주세요"}
                        value={state.hospital} onChange={handleOnChange} isError={errors.hospital} />
                </div>
            </div>

            <div className="signupPatientError">
                {error && <span className="error-text">{error}</span>}
            </div>

            <div className="signupbtnpt">
                <Button text={"회원가입"} size="large" onClick={handleSignUpPatient} />
            </div>
        </div>
    );
};

export default SignupPatient;