// src/services/auth.service.js

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
};


//Service Code for Later

// import axios from 'axios';
// import { API_ENDPOINTS } from '../utils/constants';

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL
// });

// export const registerUser = async (userData) => {
//   try {
//     const response = await api.post(API_ENDPOINTS.REGISTER, userData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Registration failed');
//   }
// };

// export const loginUser = async (credentials) => {
//   try {
//     const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
//     if (response.data.token) {
//       localStorage.setItem('token', response.data.token);
//     }
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || 'Login failed');
//   }
// };
