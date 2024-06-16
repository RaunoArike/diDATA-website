import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import 'chart.js/auto';
import styles from '../css/ChartComponent.module.css';
import { loadCharts } from '../charts';
import { updateChartData } from '../update';

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
                calculateStatistics(rawGrades);
            } catch (error) {
                console.error('Error loading chart data:', error);
            }
        };
        fetchChartData();
    }, [courseCode, assignmentId]);

    const calculateStatistics = (grades) => {
        if (!grades || grades.length === 0) return;

        const total = grades.reduce((sum, grade) => sum + Number(grade), 0);
        const avg = total / grades.length;
        const sortedGrades = [...grades].sort((a, b) => a - b);
        const mid = Math.floor(sortedGrades.length / 2);
        const median = sortedGrades.length % 2 !== 0 ? Number(sortedGrades[mid]) : (Number(sortedGrades[mid - 1]) + Number(sortedGrades[mid])) / 2;
        const highest = Math.max(...grades);
        const lowest = Math.min(...grades);

        const variance = grades.reduce((sum, grade) => sum + Math.pow(Number(grade) - avg, 2), 0) / grades.length;
        const stdDev = Math.sqrt(variance);

        setAverageGrade(avg.toFixed(2));
        setMedianGrade(median.toFixed(2));
        setHighestGrade(highest.toFixed(2));
        setLowestGrade(lowest.toFixed(2));
        setStdDevGrade(stdDev.toFixed(2));
    };

    const interpolateColor = (startColor, endColor, factor) => {
        const result = startColor.slice(1).match(/.{2}/g).map((hex, i) => {
            return Math.round(parseInt(hex, 16) + factor * (parseInt(endColor.slice(1).match(/.{2}/g)[i], 16) - parseInt(hex, 16)));
        });
        return `#${result.map(val => val.toString(16).padStart(2, '0')).join('')}`;
    };

    const processPartialMarks = (partialMarks) => {
        const interpolatedColors = {};
        Object.keys(partialMarks).forEach(mark => {
            const numericMark = parseFloat(mark);
            let color;
            if (numericMark <= 0.5) {
                color = interpolateColor('#FD3C08', '#FFB715', numericMark / 0.5);
            } else {
                color = interpolateColor('#FFB715', '#5D6CC9', (numericMark - 0.5) / 0.5);
            }
            interpolatedColors[numericMark] = color;
        });
        return interpolatedColors;
    };

    const processData = (rawData) => {
        if (!rawData || Object.keys(rawData).length === 0) {
            return { labels: [], datasets: [] };
        }
    
        const keys = Object.keys(rawData);
        const labels = [
            '# Fully correct',
            '# Incorrect',
            '# Not attempted',
            '# Not checked'
        ];
    
        const colorMapping = {
            '# Fully correct': '#5D6CC9',
            '# Incorrect': '#FD3C08',
            '# Not attempted': '#871751',
            '# Not checked': '#B9E5EF'
        };
    
        const datasets = labels.map(label => ({
            label: label,
            data: keys.map(key => rawData[key][label] ? rawData[key][label] : 0),
            backgroundColor: colorMapping[label]
        }));
    
        if (detailedPartialMarks) {
            keys.forEach((key, index) => {
                const partialMarks = rawData[key]['Partial marks'] || {};
                const sortedMarks = Object.keys(partialMarks).map(Number).sort((a, b) => a - b);
                sortedMarks.forEach(mark => {
                    const count = partialMarks[mark];
                    datasets.push({
                        label: 'Partial mark',
                        data: Array(keys.length).fill(0).map((_, i) => i === index ? count : 0),
                        backgroundColor: mark <= 0.5 
                            ? interpolateColor('#FD3C08', '#FFB715', mark / 0.5)
                            : interpolateColor('#FFB715', '#5D6CC9', (mark - 0.5) / 0.5),
                        mark: mark
                    });
                });
            });
        } else {
            datasets.push({
                label: '# Partially correct',
                data: keys.map(key => rawData[key]['# Partially correct'] ? rawData[key]['# Partially correct'] : 0),
                backgroundColor: '#FFB715'
            });
        }
    
        return { labels: keys, datasets };
    };

    const processGrades = (grades) => {
        const gradeCounts = Array(10).fill(0);
        grades.forEach(grade => {
            const index = Math.floor(grade);
            if (index < 10) {
                gradeCounts[index]++;
            } else {
                gradeCounts[9]++;
            }
        });
        return {
            labels: Array.from({ length: 10 }, (_, i) => `${i} - ${i+1}`),
            datasets: [
                {
                    label: 'Number of students',
                    data: gradeCounts,
                    backgroundColor: '#5D6CC9'
                }
            ]
        };
    };

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
            calculateStatistics(rawGrades);
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
                display: view !== 'metrics',
                labels: {
                    font: {
                        size: 16
                    },
                    filter: (legendItem) => {
                        // Hide all partial marks legends
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
                stacked: view !== 'metrics',
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
                stacked: view !== 'metrics',
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
            <div className={styles.chartContent}>
                {!isDemoMode && (
                    <div className={styles.statisticsContainer}>
                        <div className={styles.statisticBox}>
                            <p className={styles.statisticLabel}>Participants</p>
                            <p className={styles.statisticValue}>{chartData.rawGrades.length}</p>
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
                )}
                <Bar
                    data={view === 'metrics' ? processGrades(chartData.rawGrades) : processData(view === 'exercise' ? chartData.rawExerciseData : chartData.rawQuestionData)}
                    options={chartOptions}
                />
                <div className={styles.buttonContainer}>
                    <button className={styles.downloadButton} onClick={downloadChart}>
                        Download Chart
                    </button>
                    <div className={styles.toggleContainer}>
                        <label className={styles.toggleLabel}>Less detailed view</label>
                        <label className={styles.switch}>
                            <input 
                                type="checkbox"
                                checked={detailedPartialMarks}
                                onChange={() => setDetailedPartialMarks(!detailedPartialMarks)}
                            />
                            <span className={`${styles.slider} ${styles.round}`}></span>
                        </label>
                        <label className={styles.toggleLabel}>More detailed view</label>
                    </div>
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
