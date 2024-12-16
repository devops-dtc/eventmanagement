import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

const anonymousUser = {
    id: 'anonymous',
    name: 'Guest User',
    role: 'Anonymous',
    email: null
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        console.log('Initial user state from localStorage:', storedUser);
        return storedUser ? JSON.parse(storedUser) : anonymousUser;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        console.group('Auth State Changed');
        console.log({
            currentUser: user,
            isAnonymous: user.role === 'Anonymous',
            token: !!localStorage.getItem('token'),
            storedUser: !!localStorage.getItem('user')
        });
        console.groupEnd();
    }, [user]);

    useEffect(() => {
        const validateSession = async () => {
            console.group('Auth Validation Flow');
            console.log('Starting session validation');
            console.log('Initial state:', {
                userState: user,
                token: localStorage.getItem('token'),
                storedUser: localStorage.getItem('user')
            });

            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                if (!token || !storedUser) {
                    console.log('No stored credentials found');
                    setUser(anonymousUser);
                    setLoading(false);
                    return;
                }

                console.log('Found stored credentials');
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                try {
                    const response = await fetch('http://localhost:3000/api/auth/validate', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('Validation response:', {
                        status: response.status,
                        ok: response.ok
                    });

                    if (response.ok) {
                        const validationData = await response.json();
                        console.log('Validation successful:', validationData);
                        
                        // Update user data if different from stored
                        if (JSON.stringify(validationData.user) !== storedUser) {
                            setUser(validationData.user);
                            localStorage.setItem('user', JSON.stringify(validationData.user));
                        }
                    } else {
                        console.warn('Token validation failed');
                        handleLogout();
                    }
                } catch (error) {
                    console.error('Validation request failed:', error);
                    // Keep the session if it's just a network error
                }
            } catch (error) {
                console.error('Session validation error:', error);
                handleLogout();
            } finally {
                setLoading(false);
                console.groupEnd();
            }
        };

        validateSession();
    }, []);

    const handleLogout = () => {
        setUser(anonymousUser);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const login = async (credentials) => {
        console.group('Login Process');
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (data.success) {
                const { token, user: userData } = data;
                
                // Store token and user data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Update state
                setUser(userData);
                return { success: true };
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        } finally {
            console.groupEnd();
        }
    };

    const register = async (userData) => {
        console.group('Registration Process');
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                return { success: true };
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        } finally {
            console.groupEnd();
        }
    };

    const logout = async () => {
        console.group('Logout Process');
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('http://localhost:3000/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            handleLogout();
            navigate('/login');
            console.groupEnd();
        }
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        return user?.role !== 'Anonymous' && !!token && !!storedUser;
    };

    const hasRole = (roles) => {
        if (!Array.isArray(roles)) {
            roles = [roles];
        }
        return isAuthenticated() && roles.includes(user.role);
    };

    const isAnonymous = () => {
        return user?.role === 'Anonymous' || !localStorage.getItem('token');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    const contextValue = {
        user,
        login,
        logout,
        register,
        isAuthenticated,
        hasRole,
        loading,
        isAnonymous
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
