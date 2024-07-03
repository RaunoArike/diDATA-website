import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Login.module.css';

const Login = () => {
    const [apiKey, setApiKey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!apiKey.trim()) {
            setErrorMessage('Please enter your API key.');
            return;
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            };

            const response = await fetch(`http://localhost:8000/api/courses/`, {
                method: 'GET',
                headers: headers,
            });

            // The API key is currently stored in the local storage of the user's browser
            // A safer solution would be to store the API key in the backend and a user id in local storage that enables the identification of the user to retrieve the API key in the backend
            // However, this requires the creation of user profiles, which will not be finished before integration with SSO
            if (response.ok) {
                localStorage.setItem('apiKey', apiKey);
                localStorage.setItem('demoMode', 'false');
                navigate('/');
            } else {
                setErrorMessage('Invalid API key. Please try again.');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
        }
    };

    // There is a demo mode where the charts are shown using fake data rather than real student data, eg for teachers who want to get a flavour of the app but don't have an API key yet
    // This function enables navigating to the demo mode
    const handleDemo = () => {
        localStorage.setItem('demoMode', 'true');
        navigate('/');
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
                <div
                    className={styles.infoButton}
                    onClick={toggleTooltip}
                >
                    ?
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
                {errorMessage && (
                    <p id="error-message" className={styles.errorMessage}>{errorMessage}</p>
                )}
            </div>
            <button
                id="demo-button"
                className={styles.demoButton}
                onClick={handleDemo}
            >
                Demo
            </button>
        </div>
    );
};

export default Login;
