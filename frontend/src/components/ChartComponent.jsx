import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import styles from '../css/ChartComponent.module.css';
import { loadCharts } from '../charts';

const ChartComponent = ({ courseCode, assignmentId }) => {
    const [chartData, setChartData] = useState(null);
    const [assignmentName, setAssignmentName] = useState('');
    const [isShowingExerciseData, setIsShowingExerciseData] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const resp = await loadCharts(courseCode, assignmentId);
                const rawExerciseData = resp.results_by_exercise;
                const rawQuestionData = resp.results_by_question;
                setAssignmentName(resp.assignment_name);
                setChartData({
                    rawExerciseData,
                    rawQuestionData
                });
            } catch (error) {
                console.error('Error loading chart data:', error);
            }
        };
        fetchChartData();
    }, [courseCode, assignmentId]);

    const processData = (rawData) => {
        const labels = Object.keys(rawData);
        const datasets = Object.keys(rawData[labels[0]]).map((key, index) => ({
            label: key,
            data: labels.map(label => rawData[label][key][0]),
            // not checked, not attempted, 0% correct, partially correct, 100% correct
            backgroundColor: ['#B9E5EF', '#871751', '#FD3C08', '#FFB715', '#5D6CC9'][index % 5]
        }));

        return { labels, datasets };
    };

    const toggleData = () => {
        setIsShowingExerciseData(!isShowingExerciseData);
    };

    const title = isShowingExerciseData ? assignmentName + ' results by exercise' : assignmentName + ' results by question';

    const downloadChart = () => {
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = document.getElementsByTagName('canvas')[0].toDataURL('image/png');
        link.click();
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 16
                    }
                }
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 24
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    font: {
                        size: 18
                    }
                },
                ticks: {
                    font: {
                        size: 14
                    }
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Number of participants',
                    font: {
                        size: 18
                    }
                },
                ticks: {
                    font: {
                        size: 14
                    },
                    beginAtZero: true
                }
            }
        }
    };

    if (!chartData) return <div>Loading...</div>;

    return (
        <div>
            <Bar
                data={processData(isShowingExerciseData ? chartData.rawExerciseData : chartData.rawQuestionData)}
                options={chartOptions}
            />
            <div className={styles.toggleContainer}>
                <label className={styles.toggleLabel}>Exercises</label>
                <label className={styles.switch}>
                    <input type="checkbox" checked={!isShowingExerciseData} onChange={toggleData} />
                    <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
                <label className={styles.toggleLabel}>Questions</label>
            </div>
            <button className={styles.downloadButton} onClick={downloadChart}>
                Download Chart
            </button>
        </div>
    );
};

export default ChartComponent;
