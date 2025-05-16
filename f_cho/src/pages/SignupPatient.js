import "./SignupPatient.css";
import Button from "../component/Button";
import Input from "../component/Input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPatient = () => {
    const navigate = useNavigate();

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
        workspace: "",
    });

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="signuppatient">

            <div className="titlepp">
                <div className="welcomepp">
                    의사선생님, 환영합니다!
                </div>

                <div className="signuppp">
                    회원가입
                </div>
            </div>


            <div className="formgrid">
                <div className="formcolumn">

                    <div className="row">
                        <Input name="name" label={"이름"} placeholder={"이름을 입력해주세요"} value={state.name} onChange={handleOnChange} />
                        <Input name="id" label={"아이디"} placeholder={"아이디를 입력해주세요"} value={state.id} onChange={handleOnChange} />
                    </div>

                    <Input name="phone" label={"연락처"} placeholder={"연락처를 입력해주세요"} value={state.phone} onChange={handleOnChange} />
                    <Input name="email" label={"이메일"} placeholder={"이메일을 입력해주세요"} value={state.email} onChange={handleOnChange} />
                    <Input name="pw" label={"비밀번호"} placeholder={"비밀번호를 입력해주세요"} value={state.pw} onChange={handleOnChange} />
                </div>

                <div className="formcolumn">

                    <div className="row">
                        <Input name="birth" label={"생년월일"} placeholder={"YYYY-MM-DD"} value={state.birth} onChange={handleOnChange} />
                        <Input name="gender" label={"성별"} placeholder={"남 또는 여"} value={state.gender} onChange={handleOnChange} />
                    </div>

                    <Input name="address" label={"주소"} placeholder={"주소를 입력해주세요"} value={state.address} onChange={handleOnChange} />
                    <Input name="hospital" label={"근무 병원"} placeholder={"근무 병원을 입력해주세요"} value={state.hospital} onChange={handleOnChange} />
                    <Input name="workspace" label={"직장"} placeholder={"직장을 입력해주세요"} value={state.workspace} onChange={handleOnChange}/>
                </div>
            </div>


            <div className="signupbtndt">
                <Button text={"회원가입"} size="large" onClick={() => navigate("/signup/finish")} />
            </div>

        </div>
    );
};

export default SignupPatient;