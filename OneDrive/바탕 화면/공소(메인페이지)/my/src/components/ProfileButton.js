import React from "react";
import { useNavigate } from "react-router-dom";

function ProfileButton() {
    const navigate = useNavigate();
    return (
        <button
            style={{
                position: "absolute",
                top: 20,
                right: 40,
                border: "none",
                background: "none",
                cursor: "pointer",
            }}
            onClick={() => navigate("/mypage")}
        >
            <img src="/profile-icon.svg" alt="마이페이지" width={40} />
        </button>
    );
}

export default ProfileButton;