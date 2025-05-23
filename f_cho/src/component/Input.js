import "./Input.css";

const Input = ({ name, label, placeholder, value, onChange, type = "text", size = "long", isError = false, }) => {
    return (
        <div className={`inputBlock ${size}`}>
            <div className="inputLabel">
                {label}
            </div>

            <div className={`inputWrap ${isError ? "input-error":""}`}>
                <input
                    name={name}
                    type={type}
                    className="inputField"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>

        </div>
    );
};

export default Input;