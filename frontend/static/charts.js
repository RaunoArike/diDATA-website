async function loadData(name) {
    try {
        const response = await fetch('/api/data/');
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = await response.json();

        const margin = {top: 20, right: 30, bottom: 40, left: 90},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#charts")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

        const categories = Object.keys(data[Object.keys(data)[0]]);
        const x0 = d3.scaleBand()
                     .rangeRound([0, width])
                     .paddingInner(0.1)
                     .domain(Object.keys(data));
        
        const x1 = d3.scaleBand()
                     .padding(0.05)
                     .domain(categories)
                     .rangeRound([0, x0.bandwidth()]);
        
        const y = d3.scaleLinear()
                    .rangeRound([height, 0])
                    .domain([0, d3.max(Object.values(data), d => d3.max(Object.values(d)))]).nice();

        const color = d3.scaleOrdinal()
                        .domain(categories)
                        .range(d3.schemeTableau10);

        svg.append("g")
           .attr("class", "axis")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x0));

        svg.append("g")
           .attr("class", "axis")
           .call(d3.axisLeft(y).ticks(null, "s"));

        const legend = svg.append("g")
                          .attr("font-family", "sans-serif")
                          .attr("font-size", 10)
                          .attr("text-anchor", "end")
                          .selectAll("g")
                          .data(categories.slice().reverse())
                          .enter().append("g")
                          .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
              .attr("x", width - 19)
              .attr("width", 19)
              .attr("height", 19)
              .attr("fill", color);

        legend.append("text")
              .attr("x", width - 24)
              .attr("y", 9.5)
              .attr("dy", "0.32em")
              .text(d => d);

        Object.entries(data).forEach(([key, value], i) => {
            svg.selectAll(".bar")
               .data(Object.entries(value))
               .enter().append("rect")
               .attr("x", d => x0(key) + x1(d[0]))
               .attr("y", d => y(d[1]))
               .attr("width", x1.bandwidth())
               .attr("height", d => height - y(d[1]))
               .attr("fill", d => color(d[0]));
        });
    } catch (error) {
        console.error('Error loading or parsing data:', error);
    }
}