/*// src/services/auth.service.js

// Mock API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const registerUser = async (userData) => {
  try {
    // Simulate API call
    await delay(1000);
    
    // Simulate validation
    if (userData.email === 'test@test.com') {
      throw new Error('Email already exists');
    }

    // Simulate successful registration
    return {
      success: true,
      message: 'Registration successful'
    };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const loginUser = async (credentials) => {
  try {
    // Simulate API call
    await delay(1000);

    // Simulate successful login
    const mockToken = 'mock-jwt-token';
    localStorage.setItem('token', mockToken);
    
    return {
      success: true,
      token: mockToken,
      user: {
        id: 1,
        fullname: credentials.fullname,
        email: credentials.email,
        userType: credentials.userType
      }
    };
  } catch (error) {
    throw new Error(error.message || 'Login failed');
  }
};*/


//Service Code for Later

import axios from 'axios';

const API_URL = 'http://localhost:3000';
export const registerUser = async (userDetails) => {
  try {
    const response = await axios.post(`${API_URL}/registerUser`, {
      UserType: userDetails.userType,
      UserFullName: userDetails.fullname,
      UserEmail: userDetails.email,
      UserPassword: userDetails.password,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Error registering user');
    } else {
      throw new Error('Network dhn');
    }
  }
};
