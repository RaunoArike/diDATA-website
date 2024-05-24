export async function fetchCourses() {
    try {
        const apiKey = localStorage.getItem('apiKey');
        const courseSelect = document.getElementById('course-select');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        const response = await fetch(`/api/courses/`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const courses = await response.json();

        // Clear the dropdown and add a disabled 'Select a course' option as the first choice
        courseSelect.innerHTML = ''; // Clear any existing options
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a course';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        courseSelect.appendChild(defaultOption);

        // Populate dropdown with courses fetched from the server
        for (let key in courses) {
            const option = document.createElement('option');
            option.value = courses[key].id;
            option.textContent = `${courses[key].name} (${courses[key].year})`;
            courseSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}
