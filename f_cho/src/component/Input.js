import "./Input.css";

const Input = ({ name, label, placeholder, value, onChange, type = "text", size = "long" }) => {
    return (
        <div className={`inputBlock ${size}`}>
            <div className="inputLabel">
                {label}
            </div>

            <div className="inputWrap">
                <input name={name} type={type} className="inputField" placeholder={placeholder} value={value} onChange={onChange}
                />
            </div>

        </div>
    );
};

export default Input;
