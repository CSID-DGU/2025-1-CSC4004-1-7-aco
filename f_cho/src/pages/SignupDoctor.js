import "./SignupDoctor.css";
import Button from "../component/Button";
import Input from "../component/Input";
import { ReactComponent as attach_file } from "../img/attach_file.svg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupDoctor = () => {
    const navigate = useNavigate();

    const [role, setRole] = useState("");
    const [state, setState] = useState({
        name: "",
        gender: "",
        phone: "",
        email: "",
        id: "",
        pw: "",
        birth: "",
        address: "",
        hospital: "",
        certification: "", // file name or File object
    });

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

                    <Input name="email" label={"이메일"} placeholder={"이메일을 입력해주세요"} value={state.email} onChange={handleOnChange} />
                    <Input name="id" label={"아이디"} placeholder={"아이디를 입력해주세요"} value={state.id} onChange={handleOnChange} />
                    <Input name="pw" label={"비밀번호"} placeholder={"비밀번호를 입력해주세요"} value={state.pw} onChange={handleOnChange} />
                </div>

                <div className="formcolumndp">
                    <div className="row">
                        <Input name="birth" label={"생년월일"} placeholder={"YYYY-MM-DD"} value={state.birth} onChange={handleOnChange} />
                        <Input name="phone" label={"연락처"} placeholder={"연락처를 입력해주세요"} value={state.phone} onChange={handleOnChange} />
                    </div>

                    <Input name="address" label={"주소"} placeholder={"주소를 입력해주세요"} value={state.address} onChange={handleOnChange} />
                    <Input name="hospital" label={"근무 병원"} placeholder={"근무 병원을 입력해주세요"} value={state.hospital} onChange={handleOnChange} />


                    <div className="input-wrapper">
                        <label className="input-label">파일 선택</label>
                        <label htmlFor="certificate-upload" className="file-upload-label">
                            <span className="placeholder-text">{state.certification ? state.certification.name : "의사 면허증을 첨부해주세요"}</span>
                            <input type="file" id="certificate-upload" name="certificate" onChange={handleFileChange} hidden />
                            <attach_file className="upload-icon" />
                        </label>
                    </div>

                </div>
            </div>

            <div className="signupbtndt">
                <Button text={"회원가입"} size="large" onClick={() => navigate("/signup/finish")} />
            </div>
        </div>
    );
};

export default SignupDoctor;
