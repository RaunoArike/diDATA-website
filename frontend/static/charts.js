async function loadData(courseCode, assignmentId) {
    try {
        const response = await fetch(`/api/courses/${encodeURIComponent(courseCode)}/assignments/${encodeURIComponent(assignmentId)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const resp = await response.json();

        const rawData = resp.results;
        const assignmentName = resp.assignment_name;

        const groups = Object.keys(rawData)
        const subgroups = Object.keys(rawData[Object.keys(rawData)[0]]);

        console.log(subgroups);

        const data = Object.keys(rawData).map(group => {
            let obj = { group };
            for (const [key, value] of Object.entries(rawData[group])) {
                obj[key] = value[0];
            }
            return obj;
        });

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
            .domain(groups)
            .range([0, width])
            .padding([0.2]);
        
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(data), d => d3.sum(Object.values(d)))]).nice()
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            // "# not checked", "# not attempted", "# incorrect", "# partially correct", "# correct"
            .range([
                "#4a4a4a",
                "#3178c6",
                "#e36262",
                "#f4c542",
                "#4caf50"
            ]);

        var stack = d3.stack()
            .keys(subgroups);
        var stackedData = stack(data);

        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
              .attr("fill", function(d) { return color(d.key); })
              .selectAll("rect")
              // enter a second time = loop subgroup per subgroup to add all rectangles
              .data(function(d) { return d; })
              .enter().append("rect")
                .attr("x", function(d) { return x(d.data.group); })
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .attr("width",x.bandwidth())

            var legendHolder = svg.append("g")
                .attr("transform", `translate(${width + 120}, 0)`);
    
            const legend = legendHolder.selectAll(".legend")
                .data(subgroups.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
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

    } catch (error) {
        console.error('Error loading or parsing data:', error);
    }
}

loadData(courseCode, assignmentId)