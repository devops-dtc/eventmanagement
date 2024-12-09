import React from 'react';
import '../../styles/Register.css';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  disabled, 
  loading 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`custom-button ${loading ? 'loading' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
