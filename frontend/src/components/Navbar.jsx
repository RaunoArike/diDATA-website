import React from 'react';
import styles from '../css/Navbar.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <a href="/">
                    <img src={`${process.env.PUBLIC_URL}/static/img/logo.png`} alt="Logo" />
                </a>
            </div>
            <div className={styles.navLinks}>
                <a href="/settings">
                    <img src={`${process.env.PUBLIC_URL}/static/img/settings-icon.png`} alt="Settings" className={styles.navIcon} />
                </a>
                <a href="/profile">
                    <img src={`${process.env.PUBLIC_URL}/static/img/profile-icon.png`} alt="Profile" className={styles.navIcon} />
                </a>
            </div>
        </nav>
    );
}

export default Navbar;
