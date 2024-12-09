import '../../styles/Register.css';

const FormInput = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  name, 
  error 
}) => {
  return (
    <div className="form-input-wrapper">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className={`form-input ${error ? 'error' : ''}`}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default FormInput;
