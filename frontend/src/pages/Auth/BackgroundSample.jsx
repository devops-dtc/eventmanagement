import React from 'react';

const AdminEventManagement = () => {
  return (
    <div className="admin-container">
      <header className="header">
        <div className="logo-section">
          <div className="logo">easyevent</div>
        </div>
        
        <nav className="nav-menu">
          <a href="#" className="nav-item">HOME</a>
          <a href="#" className="nav-item">AS</a>
          <a href="#" className="nav-item">PROFILE</a>
          <a href="#" className="nav-item">ABOUT</a>
          <a href="#" className="nav-item">CONTACT US</a>
        </nav>

        <div className="user-profile">
          <div className="user-info">
            <div>Noesiser</div>
            <div>Ahan Ghosh</div>
          </div>
          <div className="avatar"></div>
        </div>
      </header>

      <main className="main-content">
        <h1>Event Management</h1>
        <div className="management-tabs">
          <button className="tab active">Manage Events</button>
          <button className="tab">Manage Users</button>
        </div>
      </main>
    </div>
  );
};

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  body {
    background: #E8E8E8;
  }

  .admin-container {
    background: #E8E8E8;
    position: relative;
    min-height: 100vh;
  }

  .header {
    display: flex;
    align-items: center;
    height: 90px;
    background: #F94B3E;
    position: relative;
    width: 100%;
  }

  .logo-section {
    width: 300px;
    height: 90px;
    background: #000;
    clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
    display: flex;
    align-items: center;
    padding-left: 40px;
  }

  .logo {
    font-family: 'Boogaloo', sans-serif;
    font-size: 50px;
    color: #F94B3E;
    z-index: 1;
  }

  .nav-menu {
    display: flex;
    gap: 50px;
    margin-left: 50px;
  }

  .nav-item {
    font-family: 'Boogaloo', sans-serif;
    font-size: 28px;
    color: white;
    text-decoration: none;
  }

  .user-profile {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-right: 40px;
  }

  .user-info {
    text-align: right;
    color: white;
    font-family: 'Sitara', sans-serif;
    font-weight: 700;
    font-size: 17px;
  }

  .avatar {
    width: 60px;
    height: 60px;
    background: #EADDFF;
    border-radius: 50%;
  }

  .main-content {
    padding: 30px 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    font-family: 'Inter', sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: #000;
  }

  .management-tabs {
    display: flex;
    gap: 10px;
  }

  .tab {
    padding: 15px 40px;
    border-radius: 8px;
    border: none;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    background: white;
    min-width: 160px;
  }

  .tab.active {
    background: #454545;
    color: white;
  }
`;


// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AdminEventManagement;
