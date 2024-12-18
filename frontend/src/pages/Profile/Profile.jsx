// src/pages/Profile/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import { USER_ROLES } from '../../utils/constants';
import { toast } from 'react-toastify';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import '../../styles/Enrollment.css';
import styles from '../../styles/Profile.module.css';


const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '********',
    userType: user?.role || 'Attendee'
  });

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const isAdminOrOrganizer = user?.role === USER_ROLES.ADMIN || 
                            user?.role === USER_ROLES.ORGANIZER;

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    if (isEditing) {
      setShowConfirmDialog(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveConfirm = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const renderInput = (label, value, type = 'text', field, disabled = false) => (
    <div className={`enrollment-datetime ${styles.inputContainer}`}>
      <span className={styles.label}>{label}:</span>
      <div className={styles.inputWrapper}>
        {isEditing && !disabled ? (
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={styles.editableInput}
            disabled={disabled}
          />
        ) : (
          <span className={styles.value}>{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <Navbar/>
      <h1 className="page-heading">My Profile</h1>
      <main className="main-content">
        <div className="enrollment-container">
          <div className="enrollment-content">
            <div className={`enrollment-details ${styles.profileDetails}`}>
              {renderInput('Name', userData.name, 'text', 'name')}
              {renderInput('Email', userData.email, 'email', 'email')}
              {renderInput('Phone', userData.phone, 'tel', 'phone')}
              {renderInput('Password', userData.password, 'password', 'password')}
              {renderInput('User Type', userData.userType, 'text', 'userType', true)}
            </div>
            
            <div className={`enrollment-image-section ${styles.profileImageSection}`}>
              <div className={styles.profileImageContainer}>
                {profilePic ? (
                  <img 
                    src={profilePic}
                    alt="Profile" 
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.noProfileImage}>
                    No Profile Picture Uploaded yet
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    id="profile-image-input"
                    />
                    <label 
                    htmlFor="profile-image-input" 
                    className={styles.fileInputLabel}
                    >
                    Choose Profile Picture
                    </label>
                </>
                )}
            </div>

            <div className="enrollment-button-container">
              <button 
                className="enrollment-submit-button"
                onClick={handleEditClick}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showConfirmDialog && (
        <MessageDialog
          messageHeading="Save Changes?"
          messageResponse="Save"
          onSave={handleSaveConfirm}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
};

export default Profile;
