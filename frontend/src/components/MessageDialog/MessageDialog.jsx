// src/components/MessageDialog/MessageDialog.jsx
import React from 'react';
import styles from '../../styles/MessageDialog.module.css';

const MessageDialog = ({ 
  messageHeading, 
  messageResponse,
  messageResponse2 = "Cancel",  // Second response with default value
  onSave,
  onCancel 
}) => {
  return (
    <div className={styles.messageOverlay}>
      <div className={styles.messageContainer}>
        <div className={styles.messageCard}>
          <div className={styles.messageContent}>
            <div className={styles.heading}>{messageHeading}</div>
            <div className={styles.buttonContainer}>
              <button className={styles.saveButton} onClick={onSave}>
                <div className={styles.buttonText}>{messageResponse}</div>
              </button>
              <button className={styles.cancelButton} onClick={onCancel}>
                <div className={styles.buttonText}>{messageResponse2}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDialog;
