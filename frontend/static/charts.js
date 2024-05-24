let isShowingExerciseData = true;

export async function renderCharts(courseCode, assignmentId) {
    try {
        d3.select("#charts").selectAll("*").remove();

        const apiKey = localStorage.getItem('apiKey');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        const response = await fetch(`/api/courses/${encodeURIComponent(courseCode)}/assignments/${encodeURIComponent(assignmentId)}/`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const resp = await response.json();

        const rawQuestionData = resp.results_by_question;
        const rawExerciseData = resp.results_by_exercise;
        const assignmentName = resp.assignment_name;

        document.getElementById('assignment-title').textContent = assignmentName + " results:";

        const margin = {top: 20, right: 200, bottom: 40, left: 90},
            width = 1400 - margin.left - margin.right,
            height = 800 - margin.top - margin.bottom;

        const svg = d3.select("#charts")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .padding([0.2]);

        const y = d3.scaleLinear()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .range([
                "#4a4a4a",
                "#3178c6",
                "#e36262",
                "#f4c542",
                "#4caf50"
            ]);

        const stack = d3.stack();

        let legendHolder = svg.append("g")
            .attr("transform", `translate(${width + 120}, 0)`);
    
        function updateChart(rawData) {
            svg.selectAll("*").remove();
            legendHolder.selectAll("*").remove();

            const groups = Object.keys(rawData);
            const subgroups = Object.keys(rawData[Object.keys(rawData)[0]]);

            const data = groups.map(group => {
                let obj = { group };
                for (const [key, value] of Object.entries(rawData[group])) {
                    obj[key] = value[0];
                }
                return obj;
            });

            x.domain(groups);
            y.domain([0, d3.max(Object.values(data), d => d3.sum(Object.values(d)))]).nice();
            color.domain(subgroups);
            stack.keys(subgroups);

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .selectAll("text")
                .style("font-size", "16px"); // Make x-axis tick text larger

            svg.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("font-size", "16px"); // Make y-axis tick text larger

            svg.selectAll(".tick line")
                .style("stroke-width", "2px"); // Make axis tick lines wider

            svg.selectAll(".domain")
                .style("stroke-width", "2px"); // Make axis line wider

            const stackedData = stack(data);

            svg.append("g")
                .selectAll("g")
                .data(stackedData)
                .enter().append("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .enter().append("rect")
                .attr("x", d => x(d.data.group))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth());

            const legend = legendHolder.selectAll(".legend")
                .data(subgroups.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

            legend.append("rect")
                .attr("x", 0)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", color);

            legend.append("text")
                .attr("x", -5)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .style("text-anchor", "end")
                .text(d => d);
        }

        updateChart(rawExerciseData);

        document.getElementById('toggle-button').style.display = 'block';
        document.getElementById('download-button').style.display = 'block';

        const toggleButton = document.getElementById('toggle-button');
        toggleButton.onclick = () => {
            isShowingExerciseData = !isShowingExerciseData;
            updateChart(isShowingExerciseData ? rawExerciseData : rawQuestionData);
            toggleButton.textContent = isShowingExerciseData ? 'Show Question Data' : 'Show Exercise Data';
        };
        
    } catch (error) {
        console.error('Error loading or parsing data:', error);
    }
}

export async function downloadChart(assignment_name) {
    const svgElement = document.querySelector('svg');

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgURL = 'data:image/svg+xml;base64,' + btoa(svgData);

    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.clientWidth;
        canvas.height = svgElement.clientHeight;
        const context = canvas.getContext('2d');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.drawImage(img, 0, 0);

        const pngURL = canvas.toDataURL('image/png');
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngURL;
        downloadLink.download = isShowingExerciseData ? assignment_name + 'by exercise' + '.png' : assignment_name + 'by question';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    img.src = svgURL;
}
