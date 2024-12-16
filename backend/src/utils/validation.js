import validator from 'validator';

export const validateUser = (userData) => {
    const errors = {};

    // Check if email exists and is valid
    if (!userData.email) {
        errors.email = 'Email is required';
    } else if (!validator.isEmail(userData.email)) {
        errors.email = 'Invalid email format';
    }

    // Check if password exists and meets length requirement
    if (!userData.password) {
        errors.password = 'Password is required';
    } else if (!validator.isLength(userData.password, { min: 6 })) {
        errors.password = 'Password must be at least 6 characters long';
    }

    // Check if fullname exists and meets length requirement
    if (!userData.fullname) {
        errors.fullname = 'Full name is required';
    } else if (!validator.isLength(userData.fullname, { min: 2 })) {
        errors.fullname = 'Name must be at least 2 characters long';
    }

    // Check if userType is valid
    if (userData.userType && !['Attendee', 'Organizer', 'Admin'].includes(userData.userType)) {
        errors.userType = 'Invalid user type';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateEvent = (eventData) => {
    const errors = {};

    if (!eventData.Title) {
        errors.title = 'Title is required';
    } else if (!validator.isLength(eventData.Title, { min: 3 })) {
        errors.title = 'Title must be at least 3 characters long';
    }

    if (!eventData.Description) {
        errors.description = 'Description is required';
    } else if (!validator.isLength(eventData.Description, { min: 10 })) {
        errors.description = 'Description must be at least 10 characters long';
    }

    if (!eventData.StartDate) {
        errors.startDate = 'Start date is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
