import { useNavigate } from "react-router-dom";
import "./SignupChoice.css";
import doctor from "../img/doctor.png";
import patient from "../img/patient.png";

const SignupChoice = () => {
    const navigate = useNavigate();

    const handleSelect = (role) => {
        navigate(`/signup/${role}`);
    }

    return (
        <div className="choicePage">

            <div className="title">
                어떤 유형으로 가입하시나요?
            </div>

            <div className="typeContainer">

                <div className="typeCard" onClick={() => handleSelect("doctor")}>
                    <div className="registerTitle"></div>

                    <div className="typeContent">
                        <img src={doctor} alt="doctor" className="typeImage" />

                        <div className="typeLabel">의사</div>
                        <div className="typeNote">의사 인증 수단이 필요합니다</div>
                    </div>

                </div>


                <div className="typeCard" onClick={() => handleSelect("patient")}>
                    <div className="registerTitle"></div>

                    <div className="typeContent">
                        <img src={patient} alt="patient" className="typeImage" />
                        
                        <div className="typeLabel">환자</div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default SignupChoice;