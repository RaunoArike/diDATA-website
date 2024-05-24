export async function fetchAssignments(courseId) {
    try {
        const apiKey = localStorage.getItem('apiKey');
        const assignmentSelect = document.getElementById('assignment-select');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/assignments/`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Failed to load assignments: ' + response.statusText);
        }
        const assignments = await response.json();

        assignmentSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select an assignment';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        assignmentSelect.appendChild(defaultOption);

        assignments.forEach(assignment => {
            const option = document.createElement('option');
            option.value = assignment.id;
            option.textContent = assignment.name;
            assignmentSelect.appendChild(option);
        });
        assignmentSelect.disabled = false;
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}
