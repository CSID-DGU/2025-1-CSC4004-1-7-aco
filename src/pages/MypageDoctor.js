import "./MypageDoctor.css";
import { useState, useEffect } from "react";
import Input from "../components/Input";
import Navigation from "../components/Navigation"
import { useNavigate } from "react-router-dom";
import { getUserInfo, updateUserInfo } from "../api/mypage";
import { deleteUser } from "../api/auth";

const MypageDoctor = () => {
    const navigate = useNavigate();

    const [state, setState] = useState({
        memberId: "",
        name: "",
        loginId: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "",
        memberType: "",
        createDate: "",
        hospital: "",

        password: "",
        confirmPw: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    const editableFields = ["email", "phone", "hospital"];

    const handleOnChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        });
    };

    const handleGetUserInfo = async () => {
        try {
            const userInfo = await getUserInfo();



            setState(userInfo);
        } catch (error) {
            console.error("사용자 정보를 가져오는데 실패했습니다.", error);
        }
    };

    // 페이지 로드 시 사용자 정보 가져오기
    useEffect(() => {
        handleGetUserInfo();
    }, []);



    // 이메일 형식 확인
    const isEmailValid = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 전화번호 형식 확인
    const isPhoneValid = (phone) => {
        const phoneRegex = /^\d{11}$/;
        return phoneRegex.test(phone);
    };

    // 마이페이지 수정
    const handleEdit = async () => {
        if (isEditing) {

            // 이메일 형식 확인
            if (!isEmailValid(state.email)) {
                alert("이메일 형식이 올바르지 않습니다.");
                return;
            }

            // 전화번호 형식 확인
            if (!isPhoneValid(state.phone)) {
                alert("전화번호 형식이 올바르지 않습니다.");
                return;
            }

            // 비밀번호가 입력된 경우
            if (state.password !== undefined && state.password !== null && state.password !== "") {
                if (typeof state.password === "string" && state.password.trim() === "") {
                    alert("비밀번호는 공백으로만 설정할 수 없습니다.");
                    return;
                }
                if (state.password !== state.confirmPw) {
                    alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
                    return;
                }
            }

            try {
                const response = await updateUserInfo(state.email, state.password, state.phone, state.hospital);
                console.log(response);
                alert("정보가 수정되었습니다.");
                setState(prevState => ({
                    ...prevState,
                    password: "",
                    confirmPw: ""
                }));
            } catch (error) {
                console.error("정보 수정에 실패했습니다.", error);
                alert("정보 수정에 실패했습니다. 다시 시도해주세요.");
            }

        }
        setIsEditing(!isEditing);
    };

    // 회원 탈퇴
    const handleDeleteUser = async () => {
        if (window.confirm("정말로 탈퇴하시겠습니까?")) {
            const response = await deleteUser();
            console.log(response);
            alert("탈퇴가 완료되었습니다.");
            navigate("/");
        }
    };

    return (
        <div className="md_doctorpage" style={{ background: 'none', backgroundColor: 'white' }}>
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
                                disabled={true}
                                className="input-readonly"
                            />
                            <Input
                                name="gender"
                                label={"성별"}
                                value={state.gender}
                                onChange={handleOnChange}
                                disabled={true}
                                className="input-readonly"
                            />
                        </div>

                        <Input
                            name="email"
                            label={"이메일"}
                            value={state.email}
                            onChange={handleOnChange}
                            disabled={!isEditing || !editableFields.includes("email")}
                            className={!isEditing || !editableFields.includes("email") ? "input-readonly" : ""}
                        />
                        <Input
                            name="loginId"
                            label={"아이디"}
                            value={state.loginId}
                            onChange={handleOnChange}
                            disabled={true}
                            className="input-readonly"
                        />

                        {/* 정보 수정 시 비밀번호 변경 가능 */}
                        {isEditing && (
                            <Input
                                name="password"
                                label={"새 비밀번호"}
                                value={state.password}
                                onChange={handleOnChange}
                                type="password"
                            />
                        )}

                    </div>

                    <div className="md_formcolumn">
                        <Input
                            name="birthDate"
                            label={"생년월일"}
                            value={state.birthDate}
                            onChange={handleOnChange}
                            disabled={true}
                            className="input-readonly"
                        />
                        <Input
                            name="phone"
                            label={"전화번호"}
                            value={state.phone}
                            onChange={handleOnChange}
                            disabled={!isEditing || !editableFields.includes("phone")}
                            className={!isEditing || !editableFields.includes("phone") ? "input-readonly" : ""}
                        />

                        <Input
                            name="hospital"
                            label={"근무 병원"}
                            value={state.hospital}
                            onChange={handleOnChange}
                            disabled={!isEditing || !editableFields.includes("hospital")}
                            className={!isEditing || !editableFields.includes("hospital") ? "input-readonly" : ""}
                        />

                        {/* 정보 수정 시 비밀번호 변경 가능 */}
                        {isEditing && (
                            <Input
                                name="confirmPw"
                                label={"비밀번호 확인"}
                                value={state.confirmPw}
                                onChange={handleOnChange}
                                type="password"
                            />
                        )}

                    </div>
                </div>

                <div className="md_button_container">
                    <button className="md_edit_button" onClick={handleEdit}>
                        {isEditing ? "수정 완료" : "정보 수정"}
                    </button>
                    <button className="md_delete_button" onClick={handleDeleteUser}>
                        회원 탈퇴
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MypageDoctor;