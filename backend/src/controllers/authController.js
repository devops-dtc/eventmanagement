import { 
    createUser, 
    findUserByEmail 
} from '../services/authService.js';
import { generateToken, comparePassword } from '../utils/helpers.js';
import { validateUser } from '../utils/validation.js';

export const register = async (req, res) => {
    try {
        console.log('Registration request body:', req.body);

        // Map the frontend field names to backend field names
        const { name: fullname, email, password, role: userType } = req.body;

        // Validate input
        const validationResult = validateUser({
            fullname,
            email,
            password,
            userType: userType || 'Attendee'
        });

        if (!validationResult.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.errors
            });
        }

        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = await createUser({
            fullname,
            email,
            password,
            userType: userType || 'Attendee'
        });

        const token = generateToken(user.UserID);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user.UserID,
                name: user.UserFullname,
                email: user.UserEmail,
                role: user.UserType // Changed from userType to role to match frontend
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role: userType } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.UserPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user type matches (if provided)
        if (userType && user.UserType !== userType) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user type'
            });
        }

        // Check if user is banned
        if (user.UserStatus === 'Banned') {
            return res.status(403).json({
                success: false,
                message: 'Account is banned'
            });
        }

        const token = generateToken(user.UserID);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.UserID,
                name: user.UserFullname,
                email: user.UserEmail,
                role: user.UserType // Changed from userType to role to match frontend
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};
