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
                
                // resp is a dictionary with 5 keys: results_by_exercise, results_by_question, grades, assignment_name, and last_updated
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
        const allGrades = [...grades.Pass, ...grades.Fail];
        if (!allGrades || allGrades.length === 0) return;

        const total = allGrades.reduce((sum, grade) => sum + Number(grade), 0);
        const avg = total / allGrades.length;
        const sortedGrades = [...allGrades].sort((a, b) => a - b);
        const mid = Math.floor(sortedGrades.length / 2);
        const median = sortedGrades.length % 2 !== 0 ? Number(sortedGrades[mid]) : (Number(sortedGrades[mid - 1]) + Number(sortedGrades[mid])) / 2;
        const highest = Math.max(...allGrades);
        const lowest = Math.min(...allGrades);

        const variance = allGrades.reduce((sum, grade) => sum + Math.pow(Number(grade) - avg, 2), 0) / allGrades.length;
        const stdDev = Math.sqrt(variance);
        
        // all statistics fields have 2 decimal points
        setAverageGrade(avg.toFixed(2));
        setMedianGrade(median.toFixed(2));
        setHighestGrade(highest.toFixed(2));
        setLowestGrade(lowest.toFixed(2));
        setStdDevGrade(stdDev.toFixed(2));
    };

    // This method interpolates the color of the chart bar between two colours
    // This is necessary for the gradient mode where there are many possible grades between 0 and 1
    // In those cases, we want to assign the colour based on how close the grade was to fully incorrect or fully correct
    const interpolateColor = (startColor, endColor, factor) => {
        const result = startColor.slice(1).match(/.{2}/g).map((hex, i) => {
            return Math.round(parseInt(hex, 16) + factor * (parseInt(endColor.slice(1).match(/.{2}/g)[i], 16) - parseInt(hex, 16)));
        });
        return `#${result.map(val => val.toString(16).padStart(2, '0')).join('')}`;
    };

    const processData = (rawData) => {
        // If there's no data, return an empty chart
        if (!rawData || Object.keys(rawData).length === 0) {
            return { labels: [], datasets: [] };
        }
    
        const keys = Object.keys(rawData);
        const labels = [
            '# Fully incorrect',
            '# Fully correct',
            '# Not attempted',
            '# Not checked'
        ];
    
        const colorMapping = {
            '# Fully incorrect': '#FD3C08',
            '# Fully correct': '#BAEFB9',
            '# Not attempted': '#871751',
            '# Not checked': '#5D6CC9'
        };
    
        const datasets = labels.map(label => ({
            label: label,
            data: keys.map(key => rawData[key][label] ? rawData[key][label] : 0),
            backgroundColor: colorMapping[label]
        }));
        
        // The chart has two modes: 'Stacked' and 'Detailed'
        // In the 'Stacked' mode, all of the partial marks (ie, marks between 0 and 1) are merged together into a single yellow bar
        // In the 'Detailed' mode, each different partial mark has its own bar (eg, there's a bar for grade 0.2, a bar for grade 0.4, etc)
        // If the grade is between 0 and 0.5, the colour of the bar is interpolated between red and yellow based on how close it is to either of those values
        // If the grade is between 0.5 and 1, the colour of the bar is interpolated between yellow and red
        if (detailedPartialMarks) {
            keys.forEach((key, index) => {
                const partialMarks = rawData[key]['Partial marks'] || {};
                const sortedMarks = Object.keys(partialMarks).map(Number).sort((a, b) => b - a);
                sortedMarks.forEach(mark => {
                    const count = partialMarks[mark];
                    datasets.splice(1, 0, {
                        label: 'Partial mark',
                        data: Array(keys.length).fill(0).map((_, i) => i === index ? count : 0),
                        backgroundColor: mark <= 0.5 
                            ? interpolateColor('#FD3C08', '#FFB715', mark / 0.5)
                            : interpolateColor('#FFB715', '#BAEFB9', (mark - 0.5) / 0.5),
                        mark: mark
                    });
                });
            });
        } else {
            datasets.splice(1, 0, {
                label: '# Partially correct',
                data: keys.map(key => rawData[key]['# Partially correct'] ? rawData[key]['# Partially correct'] : 0),
                backgroundColor: '#FFB715'
            });
        }
    
        return { labels: keys, datasets };
    };

    // There are 10 different bins for grades: grades between 0 and 1, grades between 1 and 2, etc
    // Since 5 to 6 is the only grade range where some of the grades correspond to a Fail and some to a Pass, the bars corresponding to fails and bars corresponding to passes are stacked on top of each other in that range
    // No other range has stacked bars
    const processGrades = (grades) => {
        const passCounts = Array(10).fill(0);
        const failCounts = Array(10).fill(0);

        grades.Pass.forEach(grade => {
            const index = Math.floor(grade);
            if (index < 10) {
                passCounts[index]++;
            } else {
                passCounts[9]++;
            }
        });

        grades.Fail.forEach(grade => {
            const index = Math.floor(grade);
            if (index < 10) {
                failCounts[index]++;
            } else {
                failCounts[9]++;
            }
        });

        return {
            labels: Array.from({ length: 10 }, (_, i) => `${i} - ${i+1}`),
            datasets: [
                {
                    label: 'Pass',
                    data: passCounts,
                    backgroundColor: '#5D6CC9'
                },
                {
                    label: 'Fail',
                    data: failCounts,
                    backgroundColor: '#871751'
                }
            ]
        };
    };

    // This method enables downloading the currently shown chart as a .png image
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
                display: true,
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
                <Bar
                    data={view === 'metrics' ? processGrades(chartData.rawGrades) : processData(view === 'exercise' ? chartData.rawExerciseData : chartData.rawQuestionData)}
                    options={chartOptions}
                />
                <div className={styles.buttonContainer}>
                    <button className={styles.downloadButton} onClick={downloadChart}>
                        Download Chart
                    </button>
                    {view !== 'metrics' && <div className={styles.toggleContainer}>
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
                    </div>}
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
