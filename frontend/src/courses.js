export async function fetchCourses() {
    const apiKey = localStorage.getItem('apiKey');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const response = await fetch(`http://localhost:8000/api/courses/`, {
        method: 'GET',
        headers: headers
    });
    console.log(response);

    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    const courses = await response.json();
    return courses;
};
