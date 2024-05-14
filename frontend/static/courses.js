async function fetchCourses() {
    try {
        const apiKey = localStorage.getItem('apiKey');

        if (!apiKey) {
            window.location.href = '/';
            return;
        }

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

        const courseArray = Object.keys(courses).map(key => ({
            name: courses[key].name,
            code: courses[key].id,
            year: courses[key].year
        }));

        console.log(courseArray)

        const listElement = d3.select("#course-list");
        const courseDivs = listElement.selectAll("div")
                   .data(courseArray)
                   .enter()
                   .append("div")
                   .attr("class", "course-link")
                   .text(d => `${d.name} (${d.year})`)
                   .on("click", async (event, d) => {
                       window.location.href = `courses/${encodeURIComponent(d.code)}/assignments`;
                   });

    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

fetchCourses()