import React from 'react';
import './Button.css';

const Button = ({ children, type = 'button', onClick, isLoading }) => {
  return (
    <button 
      className="custom-button" 
      type={type}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
