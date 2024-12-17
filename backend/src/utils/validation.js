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
        errors.Title = 'Title is required';
    } else if (eventData.Title.length < 3) {
        errors.Title = 'Title must be at least 3 characters long';
    }

    if (!eventData.Description) {
        errors.Description = 'Description is required';
    } else if (eventData.Description.length < 10) {
        errors.Description = 'Description must be at least 10 characters long';
    }

    if (!eventData.StartDate) {
        errors.StartDate = 'Start date is required';
    }

    if (!eventData.StartTime) {
        errors.StartTime = 'Start time is required';
    }

    if (!eventData.Location) {
        errors.Location = 'Location is required';
    }

    if (eventData.EndDate && new Date(eventData.EndDate) < new Date(eventData.StartDate)) {
        errors.EndDate = 'End date cannot be before start date';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
