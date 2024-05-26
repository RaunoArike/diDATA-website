export const fetchAssignments = async (courseCode) => {
    const apiKey = localStorage.getItem('apiKey');
    const response = await fetch(`http://localhost:8000/api/courses/${encodeURIComponent(courseCode)}/assignments`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch assignments');
    }
    const data = await response.json();
    return data;
};
