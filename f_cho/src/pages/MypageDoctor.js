import "./MypageDoctor.css";
import Button from "../component/Button";
import Input from "../component/Input";
import Navigation from "../component/Navigation"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MypageDoctor = () => {
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
        certification: "",
    });

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="doctorpage">
            <Navigation />

            <div className="editordoctor">
                <div className="titlemp">
                    마이 페이지
                </div>

                <div className="formgrid">
                    <div className="formcolumn">

                        <div className="row">
                            <Input name="name" label={"이름"} placeholder={"이름을 입력해주세요"} value={state.name} onChange={handleOnChange} />
                            <Input name="gender" label={"성별"} placeholder={"남 또는 여"} value={state.gender} onChange={handleOnChange} />

                        </div>

                        <Input name="id" label={"아이디"} placeholder={"아이디를 입력해주세요"} value={state.id} onChange={handleOnChange} />

                        <Input name="pw" label={"비밀번호"} placeholder={"비밀번호를 입력해주세요"} value={state.pw} onChange={handleOnChange} />
                    </div>

                    <div className="formcolumn">

                        <Input name="email" label={"이메일"} placeholder={"이메일을 입력해주세요"} value={state.email} onChange={handleOnChange} />
                        <Input name="address" label={"주소"} placeholder={"주소를 입력해주세요"} value={state.address} onChange={handleOnChange} />
                        <Input name="hospital" label={"근무 병원"} placeholder={"근무 병원을 입력해주세요"} value={state.hospital} onChange={handleOnChange} />

                        <div className="editdoctor">
                            <Button text={"수정하기"} />
                        </div>

                    </div>
                </div>
            </div>

        </div>

    );
};

export default MypageDoctor;