import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import styles from '../css/ChartComponent.module.css';
import { loadCharts } from '../charts';

const ChartComponent = ({ courseCode, assignmentId }) => {
    const [chartData, setChartData] = useState(null);
    const [assignmentName, setAssignmentName] = useState('');
    const [view, setView] = useState('exercise');

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const resp = await loadCharts(courseCode, assignmentId);
                const rawExerciseData = resp.results_by_exercise;
                const rawQuestionData = resp.results_by_question;
                const rawGrades = resp.grades;
                setAssignmentName(resp.assignment_name);
                setChartData({
                    rawExerciseData,
                    rawQuestionData,
                    rawGrades
                });
            } catch (error) {
                console.error('Error loading chart data:', error);
            }
        };
        fetchChartData();
    }, [courseCode, assignmentId]);

    const processData = (rawData) => {
        if (!rawData || Object.keys(rawData).length === 0) {
            return { labels: [], datasets: [] };
        }
    
        const labels = Object.keys(rawData);
        const colorMapping = {
            '# not checked': '#B9E5EF',
            '# not attempted': '#871751',
            '# 0% correct': '#FD3C08',
            '# partially correct': '#FFB715',
            '# 100% correct': '#5D6CC9'
        };
    
        const datasets = Object.keys(rawData[labels[0]] || {}).map((key) => ({
            label: key,
            data: labels.map(label => rawData[label][key][0]),
            backgroundColor: colorMapping[key] || '#000000' // Default to black if no match found
        }));
    
        return { labels, datasets };
    };    

    const processGrades = (grades) => {
        const gradeCounts = Array(10).fill(0);
        console.log(grades);
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
    
        link.download = `${assignmentName} results by ${view}.png`;
        link.href = whiteBackground.toDataURL('image/png');
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
                text: view === 'metrics' ? `${assignmentName} metrics` : `${assignmentName} results by ${view}`,
                font: {
                    size: 24
                }
            }
        },
        scales: {
            x: {
                stacked: view !== 'metrics',
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
                <button className={view === 'metrics' ? styles.active : ''} onClick={() => setView('metrics')}>Metrics</button>
                <button className={view === 'exercise' ? styles.active : ''} onClick={() => setView('exercise')}>Exercises</button>
                <button className={view === 'question' ? styles.active : ''} onClick={() => setView('question')}>Questions</button>
            </div>
            <Bar
                data={view === 'metrics' ? processGrades(chartData.rawGrades) : processData(view === 'exercise' ? chartData.rawExerciseData : chartData.rawQuestionData)}
                options={chartOptions}
            />
            <button className={styles.downloadButton} onClick={downloadChart}>
                Download Chart
            </button>
        </div>
    );
};

export default ChartComponent;
