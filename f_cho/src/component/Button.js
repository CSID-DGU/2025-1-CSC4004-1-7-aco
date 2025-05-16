import "./Button.css";

const Button = ({ text, onClick, disabled, size = "default" }) => {
    const classNames = [
        "Button",
        `Button_${size}`,
        disabled ? "Button_disabled" : ""
    ].join(" ");

    return (
        <button className={classNames} onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default Button;