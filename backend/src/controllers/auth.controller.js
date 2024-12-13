import {db} from '../config/database.js';
// Login endpoint
export const login= async (req, res) => {
    const details = {
        UserID: 1,
        UserFullName: 'Sreyan Dey',
        UserEmail: 'sd@email.com',
        UserPassword: 'testpass',
        UserType: 'Attendee',
        CreatedAt: null,
        UpdatedAt: null
    }; // The login details entered in the frontend is an object

    try {
        // Query database for the user
        const qData = await db.promise().query("SELECT * FROM `user` WHERE UserFullName = ?", [details.UserFullName]);

        if (qData[0].length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        let userID;
        qData[0].forEach(element => {
            userID = element.UserID;
        });
        console.log(userID);

        let isAuthenticated = false;
        if (JSON.stringify(details) === JSON.stringify(qData[0][userID - 1])) {
            isAuthenticated = true;
        }

        if (isAuthenticated) {
            console.log('Login successful');
            return res.status(200).json({ message: 'Login successful', user: qData[0][userID - 1] });
        } else {
            console.log('Login credentials wrong');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Register user endpoint
export const signup = async (req, res) => {
    const { UserFullName, UserEmail, UserPassword, UserType } = req.body;

    if (!UserFullName || !UserEmail || !UserPassword || !UserType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const query = "INSERT INTO `user` (UserFullName, UserEmail, UserPassword, UserType) VALUES (?, ?, ?, ?)";
        await db.query(query, [UserFullName, UserEmail, UserPassword, UserType]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
