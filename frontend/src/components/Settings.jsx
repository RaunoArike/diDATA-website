import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Settings.module.css';

const Settings = () => {
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
    const navigate = useNavigate();

    const toggleApiKeyVisibility = () => {
        setApiKeyVisible(!apiKeyVisible);
    };

    const removeApiKey = () => {
        localStorage.removeItem('apiKey');
        setApiKey('');
        setApiKeyVisible(false);
        navigate('/login');
    };

    return (
        <div className={styles.settingsContainer}>
            <h1>Settings</h1>
            <div className={styles.apiKeyBox}>
                <p>{apiKeyVisible ? apiKey : '************'}</p>
            </div>
            <button className={styles.toggleButton} onClick={toggleApiKeyVisibility}>
                {apiKeyVisible ? 'Hide API Key' : 'Reveal API Key'}
            </button>
            <button className={styles.removeButton} onClick={removeApiKey}>
                Remove API Key
            </button>
        </div>
    );
};

export default Settings;