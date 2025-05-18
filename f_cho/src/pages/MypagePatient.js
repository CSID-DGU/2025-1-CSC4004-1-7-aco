import "./MypagePatient.css";
import Button from "../component/Button";
import Input from "../component/Input";
import Navigation from "../component/Navigation"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MypagePatient = () => {
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
        <div className="patientpage">
            <Navigation />

            <div className="editorpatient">
                <div className="titlemp">
                    마이 페이지
                </div>

                <div className="formgrid">
                    <div className="formcolumn">

                        <div className="row">
                            <Input name="name" label={"이름"} value={state.name} onChange={handleOnChange} />
                            <Input name="gender" label={"성별"} value={state.gender} onChange={handleOnChange} />

                        </div>

                        <Input name="id" label={"아이디"} value={state.id} onChange={handleOnChange} />
                        <Input name="pw" label={"비밀번호"} value={state.pw} onChange={handleOnChange} />
                        <Input name="email" label={"이메일"} value={state.email} onChange={handleOnChange} />
                    </div>

                    <div className="formcolumn">

                        <Input name="hospital" label={"병원"} value={state.hospital} onChange={handleOnChange} />
                        <Input name="address" label={"주소"} value={state.address} onChange={handleOnChange} />
                        <Input name="worksapce" label={"직장"} value={state.hospital} onChange={handleOnChange} />

                        <div className="editpatient">
                            <Button text={"수정하기"} />
                        </div>

                    </div>
                </div>
            </div>

        </div>

    );
};

export default MypagePatient;