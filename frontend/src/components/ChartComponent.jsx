import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import 'chart.js/auto';
import styles from '../css/ChartComponent.module.css';
import { loadCharts, updateChartData } from '../charts';
import Statistics from './Statistics';
import Menu from './Menu';
import { calculateStatistics, processData, processGrades } from '../chartutils';

const ChartComponent = ({ courseCode, assignmentId }) => {
    const [chartData, setChartData] = useState(null);
    const [assignmentName, setAssignmentName] = useState('');
    const [view, setView] = useState('exercise');
    const [averageGrade, setAverageGrade] = useState(null);
    const [medianGrade, setMedianGrade] = useState(null);
    const [highestGrade, setHighestGrade] = useState(null);
    const [lowestGrade, setLowestGrade] = useState(null);
    const [stdDevGrade, setStdDevGrade] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [detailedPartialMarks, setDetailedPartialMarks] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const demoMode = localStorage.getItem('demoMode') === 'true';
        setIsDemoMode(demoMode);

        const fetchChartData = async () => {
            try {
                const resp = await loadCharts(courseCode, assignmentId, demoMode);
                
                const rawExerciseData = resp.results_by_exercise;
                const rawQuestionData = resp.results_by_question;
                const rawGrades = resp.grades;
                setAssignmentName(resp.assignment_name);
                setChartData({
                    rawExerciseData,
                    rawQuestionData,
                    rawGrades
                });
                setLastUpdated(resp.last_updated);
                calculateStatistics(rawGrades, setAverageGrade, setMedianGrade, setHighestGrade, setLowestGrade, setStdDevGrade);
            } catch (error) {
                console.error('Error loading chart data:', error);
            }
        };
        fetchChartData();
    }, [courseCode, assignmentId]);

    const downloadChart = () => {
        const chart = document.getElementsByTagName('canvas')[0];
        const link = document.createElement('a');
        const whiteBackground = document.createElement('canvas');
        const context = whiteBackground.getContext('2d');
        
        whiteBackground.width = chart.width;
        whiteBackground.height = chart.height;
        
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, whiteBackground.width, whiteBackground.height);
        
        context.drawImage(chart, 0, 0);
    
        link.download = view === 'metrics' ? `${assignmentName} grade distribution.png` : `${assignmentName} results by ${view}.png`;
        link.href = whiteBackground.toDataURL('image/png');
        link.click();
    };

    const updateChartDataHandler = async () => {
        try {
            const resp = await updateChartData(courseCode, assignmentId);
            const rawExerciseData = resp.results_by_exercise;
            const rawQuestionData = resp.results_by_question;
            const rawGrades = resp.grades;
            setAssignmentName(resp.assignment_name);
            setChartData({
                rawExerciseData,
                rawQuestionData,
                rawGrades
            });
            setLastUpdated(resp.last_updated);
            calculateStatistics(rawGrades, setAverageGrade, setMedianGrade, setHighestGrade, setLowestGrade, setStdDevGrade);
        } catch (error) {
            console.error('Error updating chart data:', error);
        }
    };

    const handleExitDemo = () => {
        localStorage.removeItem('demoMode');
        navigate('/login');
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                display: true,
                labels: {
                    font: {
                        size: 16
                    },
                    filter: (legendItem) => {
                        if (legendItem.text.startsWith('Partial mark')) {
                            return false;
                        }
                        return true;
                    },
                },
            },
            title: {
                display: true,
                text: view === 'metrics' ? `${assignmentName} grade distribution` : `${assignmentName} results by ${view}`,
                font: {
                    size: 24
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const datasetLabel = context.dataset.label || '';
                        const value = context.raw;
                        const mark = Number(context.dataset.mark);
                        if (datasetLabel === 'Partial mark') {
                            return `${datasetLabel}: ${mark.toFixed(2)} (${value} students)`;
                        }
                        return `${datasetLabel}: ${value}`;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: view === 'metrics' ? 'Grade' : '',
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
                    text: 'Number of students',
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
            <Menu view={view} setView={setView} />
            <div className={styles.chartContent}>
                <Statistics 
                    chartData={chartData} 
                    averageGrade={averageGrade}
                    medianGrade={medianGrade}
                    highestGrade={highestGrade}
                    lowestGrade={lowestGrade}
                    stdDevGrade={stdDevGrade}
                />
                <Bar
                    data={view === 'metrics' ? processGrades(chartData.rawGrades) : processData(view === 'exercise' ? chartData.rawExerciseData : chartData.rawQuestionData, detailedPartialMarks)}
                    options={chartOptions}
                />
                <div className={styles.buttonContainer}>
                    <button className={styles.downloadButton} onClick={downloadChart}>
                        Download Chart
                    </button>
                    {view !== 'metrics' && (
                        <div className={styles.toggleContainer}>
                            <label className={styles.toggleLabel}>Stacked</label>
                            <label className={styles.switch}>
                                <input 
                                    type="checkbox"
                                    checked={detailedPartialMarks}
                                    onChange={() => setDetailedPartialMarks(!detailedPartialMarks)}
                                />
                                <span className={`${styles.slider} ${styles.round}`}></span>
                            </label>
                            <label className={styles.toggleLabel}>Detailed</label>
                        </div>
                    )}
                    {isDemoMode ? (
                        <button className={styles.downloadButton} onClick={handleExitDemo}>
                            Exit Demo Mode
                        </button>
                    ) : (
                        <button className={styles.downloadButton} onClick={updateChartDataHandler}>
                            Update Chart
                        </button>
                    )}
                </div>
                {!isDemoMode && lastUpdated && (
                    <p className={styles.lastUpdated}>Last updated:<br></br>{new Date(lastUpdated).toLocaleString()}</p>
                )}
            </div>
        </div>
    );
};

export default ChartComponent;
