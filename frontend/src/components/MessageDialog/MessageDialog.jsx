// src/components/MessageDialog/MessageDialog.jsx
import React from 'react';
import '../../styles/MessageDialog.css';

const MessageDialog = ({ 
  messageHeading = "Edit Changes?", 
  messageResponse = "Save Edit",
  onSave,
  onCancel 
}) => {
  return (
    <div className="message-overlay">
      <div className="message-container">
        <div className="message-card">
          <div className="message-content">
            <div className="heading">{messageHeading}</div>
            <div className="button-container">
              <button className="save-button" onClick={onSave}>
                <div className="button-text">{messageResponse}</div>
              </button>
              <button className="cancel-button" onClick={onCancel}>
                <div className="button-text">Cancel</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDialog;
