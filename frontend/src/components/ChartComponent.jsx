import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { loadCharts } from '../charts';
import 'chart.js/auto'; // Required for tree-shaking

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
            backgroundColor: ['#4a4a4a', '#3178c6', '#e36262', '#f4c542', '#4caf50'][index % 5]
        }));

        return { labels, datasets };
    };

    const toggleData = () => {
        setIsShowingExerciseData(!isShowingExerciseData);
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right'
            },
            title: {
                display: true,
                text: assignmentName + ' results:'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Categories'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Scores'
                },
                beginAtZero: true
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
            <button onClick={toggleData}>
                {isShowingExerciseData ? 'Show Question Data' : 'Show Exercise Data'}
            </button>
        </div>
    );
};

export default ChartComponent;
