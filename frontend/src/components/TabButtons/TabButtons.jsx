import React from 'react';
import '../../styles/Components.css';

const TabButtons = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="tab-container">
      <div className="tab-buttons">
        {tabs.map(tab => (
          <button 
            key={tab.value}
            className={`tab-button ${activeTab === tab.value ? 'active' : ''}`}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabButtons;
