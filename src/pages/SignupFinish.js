import "./SignupFinish.css";
import flower from "../img/flower-bouquet.png";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const SignupFinish = () =>{
    const navigate = useNavigate();

    return (
        <div className="finishPage">

            <div className="finishTitle">
                회원가입이 완료되었습니다!
            </div>

            <img src={flower} alt="flower" className="image" />

            <Button text={"로그인 페이지로 이동"} onClick={() => navigate("/signin")} />
        </div>
    );
};

export default SignupFinish;