import "./SignupFinish.css";
import flower from "../img/flower-bouquet.png";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const SignupFinish = () =>{
    const navigate = useNavigate();

    return (
        <div className="finishPage">

            <div className="finishTitle">
                회원가입을 환영합니다!
            </div>

            <img src={flower} alt="flower" className="image" />

            <Button text={"메인페이지로 이동"} onClick={() => navigate("/mainpage")} />
        </div>
    );
};

export default SignupFinish;