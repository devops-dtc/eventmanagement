import validator from 'validator';

export const validateUser = (userData) => {
    const errors = {};

    if (!validator.isEmail(userData.email)) {
        errors.email = 'Invalid email format';
    }

    if (!validator.isLength(userData.password, { min: 6 })) {
        errors.password = 'Password must be at least 6 characters long';
    }

    if (!validator.isLength(userData.fullname, { min: 2 })) {
        errors.fullname = 'Name must be at least 2 characters long';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateEvent = (eventData) => {
    const errors = {};

    if (!validator.isLength(eventData.title, { min: 3 })) {
        errors.title = 'Title must be at least 3 characters long';
    }

    if (!validator.isLength(eventData.description, { min: 10 })) {
        errors.description = 'Description must be at least 10 characters long';
    }

    if (!validator.isDate(eventData.startDate)) {
        errors.startDate = 'Invalid start date';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};