-- First, clean existing data
DELETE FROM EVENT_ENROLLMENT;
DELETE FROM EVENT;
DELETE FROM EVENT_CATEGORY;

-- Create Event Categories and store their IDs
INSERT INTO EVENT_CATEGORY (CategoryName, Description) VALUES
('Conference', 'Professional gathering and networking events');
SET @conference_id = LAST_INSERT_ID();

INSERT INTO EVENT_CATEGORY (CategoryName, Description) VALUES
('Workshop', 'Hands-on learning sessions');
SET @workshop_id = LAST_INSERT_ID();

INSERT INTO EVENT_CATEGORY (CategoryName, Description) VALUES
('Seminar', 'Educational presentations and discussions');
SET @seminar_id = LAST_INSERT_ID();

INSERT INTO EVENT_CATEGORY (CategoryName, Description) VALUES
('Concert', 'Musical performances and shows');
SET @concert_id = LAST_INSERT_ID();

INSERT INTO EVENT_CATEGORY (CategoryName, Description) VALUES
('Exhibition', 'Display of art, products, or innovations');
SET @exhibition_id = LAST_INSERT_ID();

-- Get UserIDs for admin and organizer
SET @admin_id = (SELECT UserID FROM USER WHERE UserEmail = 'admin@test.com');
SET @organizer_id = (SELECT UserID FROM USER WHERE UserEmail = 'organizer@test.com');

-- Events created by organizer@test.com
INSERT INTO EVENT (
    Title, Description, EventType, CategoryID, 
    StartDate, StartTime, EndDate, EndTime,
    Location, Address, Price, MaxAttendees,
    TicketsAvailable, Published, EventIsApproved, 
    CreatedBy, EventIsDeleted
) VALUES
(
    'Tech Workshop 2024', 'Learn latest technologies',
    'Physical', @workshop_id, 
    DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 7 DAY), '17:00:00',
    'Tech Hub', '123 Tech Street', 49.99, 50, 50, 
    TRUE, TRUE, @organizer_id, FALSE
),
(
    'Digital Marketing Seminar', 'Master digital marketing strategies',
    'Online', @seminar_id, 
    DATE_ADD(CURDATE(), INTERVAL 14 DAY), '14:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 14 DAY), '18:00:00',
    'Virtual', 'Online Event', 29.99, 100, 100, 
    TRUE, TRUE, @organizer_id, FALSE
),
(
    'Startup Networking Event', 'Connect with fellow entrepreneurs',
    'Physical', @conference_id, 
    DATE_ADD(CURDATE(), INTERVAL 21 DAY), '18:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 21 DAY), '21:00:00',
    'Business Center', '456 Enterprise Ave', 0.00, 75, 75, 
    TRUE, TRUE, @organizer_id, FALSE
),
(
    'Web Development Bootcamp', 'Intensive coding workshop',
    'Hybrid', @workshop_id, 
    DATE_ADD(CURDATE(), INTERVAL 30 DAY), '09:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 32 DAY), '17:00:00',
    'Code Academy', '789 Developer Lane', 299.99, 30, 30, 
    TRUE, TRUE, @organizer_id, FALSE
),
(
    'Social Media Strategy Workshop', 'Build your social media presence',
    'Online', @workshop_id, 
    DATE_ADD(CURDATE(), INTERVAL 45 DAY), '10:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 45 DAY), '16:00:00',
    'Virtual', 'Online Event', 79.99, 50, 50, 
    TRUE, TRUE, @organizer_id, FALSE
);

-- Events created by admin@test.com
INSERT INTO EVENT (
    Title, Description, EventType, CategoryID, 
    StartDate, StartTime, EndDate, EndTime,
    Location, Address, Price, MaxAttendees,
    TicketsAvailable, Published, EventIsApproved, 
    CreatedBy, EventIsDeleted
) VALUES
(
    'Annual Tech Conference', 'Biggest tech conference of the year',
    'Physical', @conference_id, 
    DATE_ADD(CURDATE(), INTERVAL 60 DAY), '08:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 62 DAY), '18:00:00',
    'Convention Center', '100 Main Street', 499.99, 1000, 1000, 
    TRUE, TRUE, @admin_id, FALSE
),
(
    'Art Exhibition 2024', 'Contemporary art showcase',
    'Physical', @exhibition_id, 
    DATE_ADD(CURDATE(), INTERVAL 75 DAY), '10:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 80 DAY), '20:00:00',
    'City Gallery', '200 Art Avenue', 25.00, 200, 200, 
    TRUE, TRUE, @admin_id, FALSE
),
(
    'Leadership Summit', 'Executive leadership training',
    'Hybrid', @seminar_id, 
    DATE_ADD(CURDATE(), INTERVAL 90 DAY), '09:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 91 DAY), '17:00:00',
    'Business Hotel', '300 Corporate Blvd', 799.99, 100, 100, 
    TRUE, TRUE, @admin_id, FALSE
),
(
    'Summer Music Festival', 'Multi-genre music event',
    'Physical', @concert_id, 
    DATE_ADD(CURDATE(), INTERVAL 120 DAY), '12:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 122 DAY), '23:00:00',
    'City Park', '400 Festival Road', 150.00, 5000, 5000, 
    TRUE, TRUE, @admin_id, FALSE
),
(
    'Innovation Expo', 'Latest technology showcase',
    'Physical', @exhibition_id, 
    DATE_ADD(CURDATE(), INTERVAL 150 DAY), '09:00:00', 
    DATE_ADD(CURDATE(), INTERVAL 152 DAY), '18:00:00',
    'Tech Center', '500 Innovation Drive', 99.99, 300, 300, 
    TRUE, TRUE, @admin_id, FALSE
);


SELECT 
    e.*,
    u.UserFullname as OrganizerName,
    ec.CategoryName
FROM EVENT e
LEFT JOIN USER u ON e.CreatedBy = u.UserID
LEFT JOIN EVENT_CATEGORY ec ON e.CategoryID = ec.CategoryID
WHERE e.StartDate >= CURDATE()
AND e.Published = TRUE 
AND e.EventIsApproved = TRUE 
AND e.EventIsDeleted = FALSE
ORDER BY e.StartDate ASC, e.StartTime ASC;



-- First ensure we have an attendee user
INSERT INTO USER (UserFullname, UserEmail, UserPassword, UserType, UserStatus) 
SELECT 'Test Attendee', 'attendee@test.com', '$2b$10$ZX5qhR5Pz/X8H4eF/z6kP.YJH.2c8oqGq8cBYz9RJoydXkZp2FfXi', 'Attendee', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM USER WHERE UserEmail = 'attendee@test.com');

-- Get the attendee ID
SET @attendee_id = (SELECT UserID FROM USER WHERE UserEmail = 'attendee@test.com');

-- Past Events created by organizer@test.com
INSERT INTO EVENT (
    Title, Description, EventType, CategoryID, 
    StartDate, StartTime, EndDate, EndTime,
    Location, Address, Price, MaxAttendees,
    TicketsAvailable, Published, EventIsApproved, 
    CreatedBy, EventIsDeleted, Status
) VALUES
(
    'Past Tech Workshop 2023', 'Previous tech learning session',
    'Physical', @workshop_id, 
    DATE_SUB(CURDATE(), INTERVAL 30 DAY), '09:00:00', 
    DATE_SUB(CURDATE(), INTERVAL 30 DAY), '17:00:00',
    'Tech Hub', '123 Tech Street', 49.99, 50, 0, 
    TRUE, TRUE, @organizer_id, FALSE, 'Published'
),
(
    'Previous Marketing Summit', 'Past digital marketing event',
    'Online', @seminar_id, 
    DATE_SUB(CURDATE(), INTERVAL 45 DAY), '14:00:00', 
    DATE_SUB(CURDATE(), INTERVAL 45 DAY), '18:00:00',
    'Virtual', 'Online Event', 29.99, 100, 0, 
    TRUE, TRUE, @organizer_id, FALSE, 'Published'
),
(
    'Last Month Networking', 'Previous networking session',
    'Physical', @conference_id, 
    DATE_SUB(CURDATE(), INTERVAL 60 DAY), '18:00:00', 
    DATE_SUB(CURDATE(), INTERVAL 60 DAY), '21:00:00',
    'Business Center', '456 Enterprise Ave', 0.00, 75, 0, 
    TRUE, TRUE, @organizer_id, FALSE, 'Published'
);

-- Past Events created by admin@test.com
INSERT INTO EVENT (
    Title, Description, EventType, CategoryID, 
    StartDate, StartTime, EndDate, EndTime,
    Location, Address, Price, MaxAttendees,
    TicketsAvailable, Published, EventIsApproved, 
    CreatedBy, EventIsDeleted, Status
) VALUES
(
    'Last Year Tech Conference', 'Previous annual tech conference',
    'Physical', @conference_id, 
    DATE_SUB(CURDATE(), INTERVAL 90 DAY), '08:00:00', 
    DATE_SUB(CURDATE(), INTERVAL 88 DAY), '18:00:00',
    'Convention Center', '100 Main Street', 499.99, 1000, 0, 
    TRUE, TRUE, @admin_id, FALSE, 'Published'
),
(
    'Winter Art Exhibition', 'Past art showcase',
    'Physical', @exhibition_id, 
    DATE_SUB(CURDATE(), INTERVAL 120 DAY), '10:00:00', 
    DATE_SUB(CURDATE(), INTERVAL 115 DAY), '20:00:00',
    'City Gallery', '200 Art Avenue', 25.00, 200, 0, 
    TRUE, TRUE, @admin_id, FALSE, 'Published'
),
(
    'Previous Music Festival', 'Past music event',
    'Physical', @concert_id, 
    DATE_SUB(CURDATE(), INTERVAL 150 DAY), '12:00:00', 
    DATE_SUB(CURDATE(), INTERVAL 148 DAY), '23:00:00',
    'City Park', '400 Festival Road', 150.00, 5000, 0, 
    TRUE, TRUE, @admin_id, FALSE, 'Published'
);

-- Add enrollments for past events
INSERT INTO EVENT_ENROLLMENT (
    UserID, EventID, Status, PaymentStatus, 
    PaymentAmount, PaymentDate, TicketType, CreatedBy
)
SELECT 
    @attendee_id,
    e.EventID,
    'Confirmed',
    'Completed',
    e.Price,
    DATE_SUB(e.StartDate, INTERVAL 1 DAY),
    'Standard',
    @attendee_id
FROM EVENT e
WHERE e.StartDate < CURDATE()
AND e.EventIsDeleted = FALSE
LIMIT 3;

