export const calculateStatistics = (grades, setAverageGrade, setMedianGrade, setHighestGrade, setLowestGrade, setStdDevGrade) => {
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
    
    setAverageGrade(avg.toFixed(2));
    setMedianGrade(median.toFixed(2));
    setHighestGrade(highest.toFixed(2));
    setLowestGrade(lowest.toFixed(2));
    setStdDevGrade(stdDev.toFixed(2));
};

export const interpolateColor = (startColor, endColor, factor) => {
    const result = startColor.slice(1).match(/.{2}/g).map((hex, i) => {
        return Math.round(parseInt(hex, 16) + factor * (parseInt(endColor.slice(1).match(/.{2}/g)[i], 16) - parseInt(hex, 16)));
    });
    return `#${result.map(val => val.toString(16).padStart(2, '0')).join('')}`;
};

export const processData = (rawData, detailedPartialMarks) => {
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
    }
    datasets.splice(1, 0, {
        label: '# Partially correct',
        data: keys.map(key => rawData[key]['# Partially correct'] && !detailedPartialMarks ? rawData[key]['# Partially correct'] : 0),
        backgroundColor: '#FFB715'
    });

    return { labels: keys, datasets };
};

export const processGrades = (grades) => {
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
