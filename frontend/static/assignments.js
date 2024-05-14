async function fetchAssignments(courseCode) {
    if (!courseCode) {
        console.error('No course code provided.');
        return;
    }

    const apiKey = localStorage.getItem('apiKey');

    if (!apiKey) {
        window.location.href = '/';
        return;
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        const response = await fetch(`/api/courses/${encodeURIComponent(courseCode)}/assignments/`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Failed to load assignments: ' + response.statusText);
        }
        const assignmentsArray = await response.json();

        const listElement = d3.select("#assignment-list");
        listElement.selectAll("div").remove();
        const assignmentDivs = listElement.selectAll("div")
            .data(assignmentsArray)
            .enter()
            .append("div")
            .attr("class", "assignment-link")
            .text(d => d.name)
            .on("click", async (event, d) => {
                window.location.href = `${encodeURIComponent(d.id)}`;
            });

    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

fetchAssignments(courseCode)
