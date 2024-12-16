import { 
    createUser, 
    findUserByEmail, 
    updateUserProfile 
} from '../services/authService.js';
import { generateToken, comparePassword } from '../utils/helpers.js';
import { validateUser } from '../utils/validation.js';

export const register = async (req, res) => {
    try {
        const { fullname, email, password, userType = 'Attendee' } = req.body;

        // Validate input
        const { isValid, errors } = validateUser({ fullname, email, password });
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create user
        const user = await createUser({ fullname, email, password, userType });
        const token = generateToken(user.UserID);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.UserID,
                fullname: user.UserFullname,
                email: user.UserEmail,
                userType: user.UserType
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.UserPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is banned
        if (user.UserStatus === 'Banned') {
            return res.status(403).json({ message: 'Account is banned' });
        }

        const token = generateToken(user.UserID);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.UserID,
                fullname: user.UserFullname,
                email: user.UserEmail,
                userType: user.UserType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

export const logout = async (req, res) => {
    res.json({ message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
    try {
        const user = await findUserByEmail(req.user.UserEmail);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user.UserID,
                fullname: user.UserFullname,
                email: user.UserEmail,
                userType: user.UserType,
                createdAt: user.CreatedAt
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullname, email } = req.body;
        const userId = req.user.UserID;

        const updatedUser = await updateUserProfile(userId, { fullname, email });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.UserID,
                fullname: updatedUser.UserFullname,
                email: updatedUser.UserEmail,
                userType: updatedUser.UserType
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};