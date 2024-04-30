async function fetchAssignments() {
    try {
        const response = await fetch('/api/assignments/');
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.json();
        console.log("Fetched assignments data:", data);

        const assignments = data.assignments;
        console.log("Assignments object:", assignments);

        const assignmentsArray = Object.keys(assignments).map(key => ({
            name: assignments[key]
        }));
        console.log("Processed assignments array:", assignmentsArray);

        const listElement = d3.select("#assignment-list");
        const assignmentDivs = listElement.selectAll("div")
                   .data(assignmentsArray)
                   .enter()
                   .append("div")
                   .attr("class", "assignment-link")
                   .text(d => d.name)
                   .on("click", d => {
                       window.location.href = `chart.html?assignment=${encodeURIComponent(d.name)}`;
                   });

        console.log("Number of assignment divs added:", assignmentDivs.size());

        assignmentDivs.on("click", d => {
            console.log("Assignment clicked:", d.name);
            loadData(d.name);
        });

    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

fetchAssignments()
