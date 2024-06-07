import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Login.module.css';

const Login = () => {
    const [apiKey, setApiKey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        console.log('handleSubmit called'); // Debug log

        if (!apiKey.trim()) {
            console.log('API key is required'); // Debug log
            setErrorMessage('Please enter your API key.');
            return;
        }

        try {
            console.log('Making API call with API key:', apiKey); // Debug log
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            };

            const response = await fetch(`http://localhost:8000/api/courses/`, {
                method: 'POST',
                headers: headers,
            });

            if (response.ok) {
                console.log('API key verified, redirecting to home'); // Debug log
                localStorage.setItem('apiKey', apiKey);
                navigate('/');
            } else {
                console.log('Invalid API key response from server'); // Debug log
                setErrorMessage('Invalid API key. Please try again.');
            }
        } catch (error) {
            console.error('Error during API call:', error); // Debug log
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    const toggleTooltip = () => {
        setTooltipVisible(!tooltipVisible);
    };

    return (
        <div className={styles.loginContainer}>
            <h1>Welcome to diDATA! Please enter your API key.</h1>
            <div className={styles.apiKeyBox}>
                <input
                    type="text"
                    id="api-key-input"
                    className={styles.apiKeyInput}
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                    id="submit-button"
                    className={styles.submitButton}
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                {errorMessage && (
                    <p id="error-message" className={styles.errorMessage}>{errorMessage}</p>
                )}
                <div
                    className={styles.infoButton}
                    onClick={toggleTooltip}
                >
                    ?
                </div>
                {tooltipVisible && (
                    <div className={styles.infoTooltip}>
                        <p>
                            You need to use your ANS API key to access diDATA. To obtain an API key, follow the{' '}
                            <a href="https://support.ans.app/hc/en-us/articles/4411711239697-Create-API-token">
                                instructions in the ANS API documentation.
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
