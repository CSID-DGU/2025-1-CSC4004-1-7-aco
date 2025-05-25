import "./Input.css";

const Input = ({ name, label, placeholder, value, onChange, type = "text", size = "long", isError = false, disabled = false }) => {
    return (
        <div className={`inputBlock ${size}`}>
            <div className="inputLabel">
                {label}
            </div>

            <div className={`inputWrap ${isError ? "input-error":""} ${disabled ? "input-disabled" : ""}`}>
                <input
                    name={name}
                    type={type}
                    className={`inputField ${disabled ? "input-disabled" : ""}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            </div>

        </div>
    );
};

export default Input;