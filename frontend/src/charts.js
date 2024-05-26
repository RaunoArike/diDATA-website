export async function loadCharts(courseCode, assignmentId) {
    const apiKey = localStorage.getItem('apiKey');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const response = await fetch(`http://localhost:8000/api/courses/${encodeURIComponent(courseCode)}/assignments/${encodeURIComponent(assignmentId)}/`, {
        method: 'GET',
        headers: headers
    });
    console.log(response);

    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    const charts = await response.json();
    return charts;
};