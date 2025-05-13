import Button from "../component/Button";

const Signin =() =>{
    return (
        <div>
            <Button text={"로그인"} onClick={()=>{alert("로그인")}} />
        </div>
    );
};

export default Signin;