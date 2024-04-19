async function loadData() {
    try {
        const response = await fetch('/api/data/'); // Adjust URL as needed
        const data = await response.json();

        // Now, use D3.js to visualize 'data'
        console.log(data); // For debugging, remove in production

        // Example: Simple text data visualization
        d3.select('#visualization')
          .selectAll('p')
          .data(data.data) // Adjust according to the JSON structure
          .enter()
          .append('p')
          .text(d => `Name: ${d.name}, Value: ${d.value}`); // Adjust according to your data fields
    } catch (error) {
        console.error('Error loading or parsing data:', error);
    }
}

// Call loadData on script load
loadData();