import React from 'react';
import styles from '../css/ChartComponent.module.css';

const Statistics = ({ chartData, averageGrade, medianGrade, highestGrade, lowestGrade, stdDevGrade }) => {
    return (
        <div className={styles.statisticsContainer}>
            <div className={styles.statisticBox}>
                <p className={styles.statisticLabel}>Participants</p>
                <p className={styles.statisticValue}>{chartData.rawGrades.Pass.length + chartData.rawGrades.Fail.length}</p>
            </div>
            <div className={styles.statisticBox}>
                <p className={styles.statisticLabel}>Average Grade</p>
                <p className={styles.statisticValue}>{averageGrade}</p>
            </div>
            <div className={styles.statisticBox}>
                <p className={styles.statisticLabel}>Median Grade</p>
                <p className={styles.statisticValue}>{medianGrade}</p>
            </div>
            <div className={styles.statisticBox}>
                <p className={styles.statisticLabel}>Highest Grade</p>
                <p className={styles.statisticValue}>{highestGrade}</p>
            </div>
            <div className={styles.statisticBox}>
                <p className={styles.statisticLabel}>Lowest Grade</p>
                <p className={styles.statisticValue}>{lowestGrade}</p>
            </div>
            <div className={styles.statisticBox}>
                <p className={styles.statisticLabel}>Standard Deviation</p>
                <p className={styles.statisticValue}>{stdDevGrade}</p>
            </div>
        </div>
    );
};

export default Statistics;
