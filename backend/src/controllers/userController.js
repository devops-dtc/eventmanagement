import { 
    fetchAllUsers,
    fetchUserById,
    banUserById,
    unbanUserById,
    updateUserRole
} from '../services/userService.js';

export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;
        const users = await fetchAllUsers({ page, limit, search, status });
        res.json(users);
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await fetchUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('User details fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
};

export const banUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const banReason = req.body.reason;
        const bannedBy = req.user.UserID;

        await banUserById(userId, bannedBy, banReason);
        res.json({ message: 'User banned successfully' });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ message: 'Failed to ban user' });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await unbanUserById(userId);
        res.json({ message: 'User unbanned successfully' });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ message: 'Failed to unban user' });
    }
};

export const changeUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const newRole = req.body.role;
        await updateUserRole(userId, newRole);
        res.json({ message: 'User role changed successfully' });
    } catch (error) {
        console.error('User role change error:', error);
        res.status(500).json({ message: 'Failed to change user role' });
    }
};