# eventmanagement


## To Run the frontend

```
cd frontend    
npm install
npm run dev
```

## To test the frontend Properly without Backend
```
// Test credentials
attendee@test.com    (Role: Attendee)
organizer@test.com   (Role: Organizer)
admin@test.com       (Role: Super Admin)
// Any password will work with the dummy logic
```

To add this repo

```
git remote add origin https://github.com/devops-dtc/eventmanagement.git  
```
Frontend Src Structure

```

Src
│   App.jsx
│   index.css
│   main.jsx
│   
├───assets
│       screenshot.png
│       
├───components
│   ├───Button
│   │       Button.jsx
│   │       
│   ├───FormInput
│   │       FormInput.jsx
│   │       
│   ├───Layout
│   │   └───Navbar
│   │           Navbar.jsx
│   │           
│   ├───MessageDialog
│   │       MessageDialog.jsx
│   │       
│   ├───ProtectedRoute
│   │       ProtectedRoute.jsx
│   │       
│   └───TabButtons
│           TabButtons.jsx
│           
├───constants
│       eventTypes.js
│       userRoles.jsx
│       
├───contexts
│       AuthContext.jsx
│       
├───mockdata
│       AdminEventManagementData.json
│       AdminUserList.json
│       BannedUsers.json
│       EventsData.js
│       OrganizerEventManagementData.json
│       OrganizerUserList.json
│       
├───pages
│   ├───Auth
│   │       Login.jsx
│   │       Register.jsx
│   │       
│   ├───Enrollment
│   │       Enrollment.jsx
│   │       
│   ├───EventManagement
│   │       CreateEvent.jsx
│   │       EditEvent.jsx
│   │       EventManagementDashboard.jsx
│   │       UserManagementDashboard.jsx
│   │       
│   ├───Home
│   │       AboutUs.jsx
│   │       ContactUs.jsx
│   │       Home.jsx
│   │       
│   └───Profile
│           Profile.jsx
│           
├───services
│   │   auth.service.js
│   │   event.service.js
│   │   
│   └───api
│           axios.config.js
│           endpoints.js
│           
├───styles
│       Components.css
│       ContactAbout.module.css
│       EditEvent.module.css
│       Enrollment.css
│       EventManagement.module.css
│       MessageDialog.module.css
│       Navbar.module.css
│       OrganizerEvents.css
│       Profile.module.css
│       Register.css
│       
└───utils
        constants.js
        validation.js
        

```