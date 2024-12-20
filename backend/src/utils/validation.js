import validator from 'validator';

export const validateUser = (userData) => {
    const errors = {};

    if (!userData.email) {
        errors.email = 'Email is required';
    } else if (!validator.isEmail(userData.email)) {
        errors.email = 'Invalid email format';
    }

    if (!userData.password) {
        errors.password = 'Password is required';
    } else if (!validator.isLength(userData.password, { min: 6 })) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (!userData.fullname) {
        errors.fullname = 'Full name is required';
    } else if (!validator.isLength(userData.fullname, { min: 2 })) {
        errors.fullname = 'Name must be at least 2 characters long';
    }

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

    if (eventData.Pin_Code && !validator.isLength(eventData.Pin_Code, { min: 4, max: 10 })) {
        errors.pinCode = 'Invalid PIN code format';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

