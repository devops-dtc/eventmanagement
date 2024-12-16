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
    const [user, setUser] = useState(anonymousUser);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const validateSession = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                if (token && storedUser) {
                    // Validate token with backend
                    const response = await fetch('http://localhost:3000/api/auth/validate', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                    } else {
                        // If token validation fails, revert to anonymous user
                        setUser(anonymousUser);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } else {
                    // No token or stored user, set as anonymous
                    setUser(anonymousUser);
                }
            } catch (error) {
                console.error('Session validation error:', error);
                setUser(anonymousUser);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        validateSession();
    }, []);

    const login = async (userData) => {
        try {
            // Validate user role
            if (!userData.role || !Object.values(USER_ROLES).includes(userData.role)) {
                throw new Error('Invalid user role');
            }

            // Ensure all required fields are present
            const requiredFields = ['id', 'name', 'role', 'email'];
            const missingFields = requiredFields.filter(field => !userData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

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
        }
    };

    const logout = () => {
        setUser(anonymousUser);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only navigate to login if we're not already there
        if (window.location.pathname !== '/login') {
            navigate('/login');
        }
    };

    const isAuthenticated = () => {
        return user?.role !== 'Anonymous' && !!localStorage.getItem('token');
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

    const updateUser = async (updates) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true };
            } else {
                throw new Error(data.message || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                error: error.message || 'Profile update failed'
            };
        }
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
        updateUser,
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
