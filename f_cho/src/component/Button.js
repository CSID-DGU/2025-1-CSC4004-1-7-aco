import "./Button.css";

const Button = ({ text, type, onClick, disabled, size = "default", isSelected, className = "" }) => {
    const btnType = ["MAIL", "FEMAIL"].includes(type) ? type : "basic";
    const classNames = [
        "Button",
        `Button_${size}`,
        `Button_${btnType}`,
        disabled ? "Button_disabled" : "",
        isSelected ? "Button_selected" : "",
        className
    ].join(" ");

    return (
        <button className={classNames} onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default Button;