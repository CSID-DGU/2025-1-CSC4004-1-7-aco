import "./Button.css";

const Button = ({ text, onClick, disabled }) => {
    const classNames = [
        "Button",
        disabled ? "Button_disabled" : ""
    ].join(" ");

    return (
        <button className={classNames} onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default Button;