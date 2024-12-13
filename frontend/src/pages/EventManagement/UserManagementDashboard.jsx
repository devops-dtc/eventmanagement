import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar/Navbar';
import MessageDialog from '../../components/MessageDialog/MessageDialog';
import { USER_ROLES } from '../../utils/constants';
import styles from '../../styles/EventManagement.module.css';
import adminUsersData from '../../mockdata/AdminUserList.json';
import organizerUsersData from '../../mockdata/OrganizerUserList.json';
import bannedUsersData from '../../mockdata/BannedUsers.json';

const UserManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const eventDetails = location.state;

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== USER_ROLES.SUPER_ADMIN && user?.role !== USER_ROLES.ORGANIZER) {
    return <Navigate to="/unauthorized" />;
  }

  const isAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  const getInitialUserList = useCallback(() => {
    if (eventDetails?.eventId) {
      return isAdmin 
        ? (adminUsersData.eventSpecificUsers[eventDetails.eventId] || [])
        : (organizerUsersData.eventSpecificUsers[eventDetails.eventId] || []);
    }
    return isAdmin 
      ? adminUsersData.platformUsers 
      : organizerUsersData.organizerUsers;
  }, [isAdmin, eventDetails]);

  const [activeManagementTab, setActiveManagementTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showCreateConfirmDialog, setShowCreateConfirmDialog] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState({ 
    show: false, 
    userId: null, 
    x: 0, 
    y: 0 
  });
  const [bannedUsers, setBannedUsers] = useState(bannedUsersData.bannedUsers || []);
  const [users, setUsers] = useState(getInitialUserList);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Attendee'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showOptionsMenu.show && !e.target.closest(`.${styles.menuButton}`)) {
        setShowOptionsMenu({ show: false, userId: null, x: 0, y: 0 });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptionsMenu.show]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleManagementTabChange = (tab) => {
    setActiveManagementTab(tab);
    if (tab === 'events') {
      navigate('/event-management');
    }
  };

  const handleCheckUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCheckAll = (e) => {
    setSelectedUsers(
      e.target.checked ? filteredUsers.map(user => user.id) : []
    );
  };

  const handleDeleteUsers = () => {
    setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
    setShowDeleteDialog(false);
  };

  const canBanUser = useCallback((targetUser) => {
    if (!targetUser || targetUser.role === 'Banned') return false;
    return isAdmin ? targetUser.role !== 'Admin' : targetUser.role === 'Attendee';
  }, [isAdmin]);

  const handleBanUser = () => {
    if (!userToBan) return;

    const bannedUser = {
      ...userToBan,
      role: 'Banned',
      bannedAt: new Date().toISOString().split('T')[0],
      bannedBy: user.email,
    };

    setBannedUsers(prev => [...prev, bannedUser]);
    setUsers(prev => prev.map(u => 
      u.id === userToBan.id 
        ? { ...u, role: 'Banned' }
        : u
    ));
    
    setShowBanDialog(false);
    setUserToBan(null);
    setShowOptionsMenu({ show: false, userId: null, x: 0, y: 0 });
  };

  const handleOptionMenuClick = (e, user) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setShowOptionsMenu({
      show: true,
      userId: user.id,
      x: rect.left - 150, // Adjust the width of your menu to position it properly
      y: rect.bottom + window.scrollY
    });
  };
  

  const validateForm = () => {
    const errors = {};
    
    if (!newUser.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = 'Invalid email format';
    }

    if (!newUser.password) {
      errors.password = 'Password is required';
    } else if (newUser.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

    const handleAddUserSubmit = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const newUserId = Math.random().toString(36).substr(2, 9);
      const newUserData = {
        id: newUserId,
        name: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      };

      setUsers(prev => [...prev, newUserData]);
      
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Attendee'
      });
      setFormErrors({});
      setShowAddUserDialog(false);
      setShowCreateConfirmDialog(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setFormErrors({ submit: 'Failed to create user. Please try again.' });
    }
  };

  const getPageTitle = useCallback(() => {
    if (eventDetails?.eventId) {
      return `Users for Event: ${eventDetails.eventTitle}`;
    }
    return isAdmin ? `All Platform Users (${filteredUsers.length})` : `My Event Users (${filteredUsers.length})`;
  }, [eventDetails, isAdmin, filteredUsers.length]);

  const renderRoleButton = (role) => {
    let buttonClass = styles.roleButton;
    switch (role?.toLowerCase()) {
      case 'admin':
        buttonClass += ` ${styles.adminRole}`;
        break;
      case 'organizer':
        buttonClass += ` ${styles.organizerRole}`;
        break;
      case 'attendee':
        buttonClass += ` ${styles.attendeeRole}`;
        break;
      case 'banned':
        buttonClass += ` ${styles.bannedRole}`;
        break;
      default:
        buttonClass += ` ${styles.attendeeRole}`;
    }
    return <div className={buttonClass}>{role}</div>;
  };

  const renderAddUserDialog = () => (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.wideModal}`}>
        <div className={styles.modalHeader}>
          <h2>Add New User</h2>
          <button 
            className={styles.closeButton}
            onClick={() => setShowAddUserDialog(false)}
          >
            ×
          </button>
        </div>
        <form className={styles.userForm} onSubmit={(e) => {
          e.preventDefault();
          setShowCreateConfirmDialog(true);
        }}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={newUser.fullName}
              onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
              className={formErrors.fullName ? styles.errorInput : ''}
            />
            {formErrors.fullName && <span className={styles.errorText}>{formErrors.fullName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              className={formErrors.email ? styles.errorInput : ''}
            />
            {formErrors.email && <span className={styles.errorText}>{formErrors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              className={formErrors.password ? styles.errorInput : ''}
            />
            {formErrors.password && <span className={styles.errorText}>{formErrors.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={newUser.confirmPassword}
              onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={formErrors.confirmPassword ? styles.errorInput : ''}
            />
            {formErrors.confirmPassword && <span className={styles.errorText}>{formErrors.confirmPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">User Type</label>
            <select
              id="role"
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
            >
              {isAdmin && <option value="Organizer">Organizer</option>}
              <option value="Attendee">Attendee</option>
            </select>
          </div>

          {formErrors.submit && <div className={styles.submitError}>{formErrors.submit}</div>}

          <div className={styles.formActions}>
            <button 
              type="button" 
              className={`${styles.roleButton} ${styles.adminRole}`}
              onClick={() => setShowAddUserDialog(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.addButton}
            >
              + Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className={styles.adminContainer}>
      <Navbar />
      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>User Management</h1>
          <div className={styles.managementTabs}>
            <button 
              className={`${styles.tabButton} ${activeManagementTab === 'events' ? styles.active : ''}`}
              onClick={() => handleManagementTabChange('events')}
            >
              Manage Events
            </button>
            <button 
              className={`${styles.tabButton} ${activeManagementTab === 'users' ? styles.active : ''}`}
              onClick={() => handleManagementTabChange('users')}
            >
              Manage Users
            </button>
          </div>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.whiteContainer}>
            <div className={styles.header}>
              <div className={styles.tabSection}>
                <h2 className={styles.eventTitle}>{getPageTitle()}</h2>
              </div>
              
              <div className={styles.actionSection}>
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={handleSearch}
                    className={styles.searchInput}
                    disabled={users.length === 0}
                  />
                </div>
                
                <button 
                  className={styles.addButton} 
                  onClick={() => setShowAddUserDialog(true)}
                >
                  + Add User
                </button>

                <button 
                  className={`${styles.deleteButton} ${selectedUsers.length > 0 ? styles.active : ''}`}
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={selectedUsers.length === 0}
                >
                  Delete User{selectedUsers.length > 1 ? 's' : ''}
                </button>
              </div>
            </div>

            {users.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>👥</div>
                <h3 className={styles.emptyStateTitle}>No Users Yet</h3>
                <p className={styles.emptyStateText}>
                  {eventDetails?.eventId 
                    ? "This event doesn't have any users yet. Add users to get started!"
                    : "There are no users in the system yet. Add users to get started!"}
                </p>
                <button 
                  className={styles.addButton}
                  onClick={() => setShowAddUserDialog(true)}
                >
                  + Add First User
                </button>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <colgroup>
                    <col style={{ width: '40px' }} />
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '40%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '40px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className={styles.checkbox}>
                        <input 
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={handleCheckAll}
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleCheckUser(user.id)}
                          />
                        </td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{renderRoleButton(user.role)}</td>
                        <td className={styles.menuCell}>
                          <button 
                            className={styles.menuButton}
                            onClick={(e) => handleOptionMenuClick(e, user)}
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddUserDialog && renderAddUserDialog()}

      {showCreateConfirmDialog && (
        <MessageDialog
          messageHeading="Create New User?"
          messageText={`Are you sure you want to create a new ${newUser.role.toLowerCase()} account for ${newUser.fullName}?`}
          messageResponse="Create User"
          messageResponse2="Cancel"
          onSave={handleAddUserSubmit}
          onCancel={() => setShowCreateConfirmDialog(false)}
        />
      )}

      {showOptionsMenu.show && (
        <div 
          className={styles.optionsMenu}
          style={{ 
            position: 'fixed', 
            left: showOptionsMenu.x,
            top: showOptionsMenu.y,
            zIndex: 1000
          }}
        >
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {filteredUsers.find(u => u.id === showOptionsMenu.userId)?.name}
            </div>
            <div className={styles.userRoleContainer}>
              {renderRoleButton(filteredUsers.find(u => u.id === showOptionsMenu.userId)?.role)}
            </div>
            {canBanUser(filteredUsers.find(u => u.id === showOptionsMenu.userId)) && (
              <button 
                className={styles.banButton}
                onClick={() => {
                  setUserToBan(filteredUsers.find(u => u.id === showOptionsMenu.userId));
                  setShowBanDialog(true);
                  setShowOptionsMenu({ show: false, userId: null, x: 0, y: 0 });
                }}
              >
                Ban User
              </button>
            )}
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <MessageDialog
          messageHeading={`Delete ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}?`}
          messageText="This action cannot be undone."
          messageResponse="Delete"
          messageResponse2="Cancel"
          onSave={handleDeleteUsers}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {showBanDialog && (
        <MessageDialog
          messageHeading="Ban User?"
          messageText={`Are you sure you want to ban ${userToBan?.name}? This action will restrict their access to the platform.`}
          messageResponse="Ban User"
          messageResponse2="Cancel"
          onSave={handleBanUser}
          onCancel={() => {
            setShowBanDialog(false);
            setUserToBan(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
