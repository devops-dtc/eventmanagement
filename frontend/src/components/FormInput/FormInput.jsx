import React from 'react';
import './FormInput.css';

const FormInput = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  error, 
  name,
  ...props 
}) => {
  return (
    <div className="form-input-container">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className={`form-input ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default FormInput;
