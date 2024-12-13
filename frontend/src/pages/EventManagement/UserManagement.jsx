import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import OrganizerAdminNavbar from '../../components/Layout/Navbar/OrganizerAdminNavbar';
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
  const isAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  // Function to get initial user list
  const getInitialUserList = () => {
    if (eventDetails?.eventId) {
      return isAdmin 
        ? adminUsersData.eventSpecificUsers[eventDetails.eventId] 
        : organizerUsersData.eventSpecificUsers[eventDetails.eventId] || [];
    }
    return isAdmin 
      ? adminUsersData.platformUsers 
      : organizerUsersData.organizerUsers;
  };

  const [activeManagementTab, setActiveManagementTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState({ 
    show: false, 
    userId: null, 
    x: 0, 
    y: 0 
  });
  const [bannedUsers, setBannedUsers] = useState(bannedUsersData.bannedUsers);
  const [users, setUsers] = useState(getInitialUserList());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showOptionsMenu.show && !e.target.closest(`.${styles.menuButton}`)) {
        setShowOptionsMenu({ show: false, userId: null, x: 0, y: 0 });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptionsMenu.show]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== USER_ROLES.SUPER_ADMIN && user?.role !== USER_ROLES.ORGANIZER) {
    return <Navigate to="/unauthorized" />;
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canBanUser = (targetUser) => {
    if (targetUser.role === 'Banned') return false;
    
    if (isAdmin) {
      return targetUser.role !== 'Admin'; // Admins can't ban other admins
    } else {
      // Organizers can only ban attendees
      return targetUser.role === 'Attendee';
    }
  };

  const handleAddUser = () => {
    navigate('/add-user', {
      state: {
        eventId: eventDetails?.eventId,
        eventTitle: eventDetails?.eventTitle,
        sourceRoute: '/user-management',
        previousState: location.state
      }
    });
  };

  const handleManagementTabChange = (value) => {
    setActiveManagementTab(value);
    if (value === 'events') {
      navigate('/event-management');
    } else {
      navigate('/user-management');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleDeleteUsers = () => {
    const updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
    setUsers(updatedUsers);
    setShowDeleteDialog(false);
    setSelectedUsers([]);
  };

  const handleBanUser = () => {
    if (!userToBan) return;

    const bannedUser = {
      ...userToBan,
      role: 'Banned',
      bannedAt: new Date().toISOString().split('T')[0],
      bannedBy: user.email,
      reason: "Violation of terms"
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
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setShowOptionsMenu({
      show: true,
      userId: user.id,
      x: rect.x - 120,
      y: rect.bottom
    });
  };

  const renderRoleButton = (role) => {
    let buttonClass = styles.roleButton;
    switch (role.toLowerCase()) {
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

  const getPageTitle = () => {
    if (eventDetails?.eventId) {
      return `Users for Event: ${eventDetails.eventTitle}`;
    }
    return isAdmin 
      ? `All Platform Users (${filteredUsers.length})` 
      : `My Event Users (${filteredUsers.length})`;
  };

  return (
    <div className={styles.adminContainer}>
      <OrganizerAdminNavbar />
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
                  />
                </div>
                
                <button 
                  className={styles.addButton} 
                  onClick={handleAddUser}
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
          </div>
        </div>
      </div>
             {showOptionsMenu.show && (
        <div 
          className={styles.optionsMenu}
          style={{ 
            position: 'fixed', 
            left: showOptionsMenu.x,
            top: showOptionsMenu.y,
            zIndex: 1000,
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px'
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


