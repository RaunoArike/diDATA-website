import React from 'react';
import styles from '../css/ChartComponent.module.css';

const Menu = ({ view, setView }) => {
    return (
        <div className={styles.menu}>
            <button 
                className={`${styles.menuLabel} ${view === 'metrics' ? styles.active : ''}`} 
                onClick={() => setView('metrics')}
            >
                Metrics
            </button>
            <button 
                className={`${styles.menuLabel} ${view === 'exercise' ? styles.active : ''}`} 
                onClick={() => setView('exercise')}
            >
                Exercises
            </button>
            <button 
                className={`${styles.menuLabel} ${view === 'question' ? styles.active : ''}`} 
                onClick={() => setView('question')}
            >
                Questions
            </button>
        </div>
    );
};

export default Menu;
