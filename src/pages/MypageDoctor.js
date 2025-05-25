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
        password: "",
        confirmPw: "",
        birthDate: "",
        hospital: "",
        certification: "",
        licenseNumber: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    const handleEdit = () => {
        if (isEditing) {
            // TODO: API 호출하여 정보 업데이트
            alert("정보가 수정되었습니다.");
        }
        setIsEditing(!isEditing);
    };

    const handleDelete = () => {
        if (window.confirm("정말로 탈퇴하시겠습니까?")) {
            // TODO: API 호출하여 계정 삭제
            alert("탈퇴가 완료되었습니다.");
            navigate("/");
        }
    };

    return (
        <div className="md_doctorpage">
            <Navigation />

            <div className="md_editordoctor">
                <div className="md_titlemp">
                    마이 페이지
                </div>

                <div className="md_formgrid">
                    <div className="md_formcolumn">
                        <div className="md_row">
                            <Input 
                                name="name" 
                                label={"이름"} 
                                value={state.name} 
                                onChange={handleOnChange}
                                disabled={!isEditing}
                            />
                            <Input 
                                name="gender" 
                                label={"성별"} 
                                value={state.gender} 
                                onChange={handleOnChange}
                                disabled={!isEditing}
                            />
                        </div>

                        <Input 
                            name="email" 
                            label={"이메일"} 
                            value={state.email} 
                            onChange={handleOnChange}
                            disabled={!isEditing}
                        />
                        <Input 
                            name="id" 
                            label={"아이디"} 
                            value={state.id} 
                            onChange={handleOnChange}
                            disabled={true}
                        />

                        <Input 
                            name="password" 
                            type="password"
                            label={"비밀번호"} 
                            value={state.password} 
                            onChange={handleOnChange}
                            disabled={!isEditing}
                        />
                        
                    </div>

                    <div className="md_formcolumn">
                        <Input 
                            name="birth" 
                            label={"생년월일"} 
                            value={state.birth} 
                            onChange={handleOnChange}
                            disabled={!isEditing}
                        />
                        <Input 
                            name="phone" 
                            label={"연락처"} 
                            value={state.phone} 
                            onChange={handleOnChange}
                            disabled={!isEditing}
                        />
                        
                        <Input 
                            name="hospital" 
                            label={"근무 병원"} 
                            value={state.hospital} 
                            onChange={handleOnChange}
                            disabled={!isEditing}
                        />

                        <Input 
                            name="licenseNumber" 
                            label={"의사 면허증 번호"} 
                            value={state.licenseNumber} 
                            onChange={handleOnChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="md_button_container">
                    <button className="md_edit_button" onClick={handleEdit}>
                        {isEditing ? "수정 완료" : "정보 수정"}
                    </button>
                    <button className="md_delete_button" onClick={handleDelete}>
                        회원 탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MypageDoctor;