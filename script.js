function createTimeline(data) {
    const width = 1000;
    const height = 800;
    const margin = { top: 20, right: 20, bottom: 20, left: 100 };

    const svg = d3.select("#timeline")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleLinear()
        .domain([-2000, 2025])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    const religionGroups = svg.selectAll(".religion-group")
        .data(data)
        .enter().append("g")
        .attr("class", "religion-group")
        .attr("transform", d => `translate(0, ${yScale(d.name)})`);

    religionGroups.append("rect")
        .attr("x", d => xScale(d.start))
        .attr("width", d => xScale(d.end) - xScale(d.start))
        .attr("height", yScale.bandwidth())
        .attr("fill", "#69b3a2");

    religionGroups.selectAll(".denomination")
        .data(d => d.children)
        .enter().append("rect")
        .attr("class", "denomination")
        .attr("x", d => xScale(d.start))
        .attr("width", d => xScale(d.end) - xScale(d.start))
        .attr("y", (d, i) => i * (yScale.bandwidth() / 3))
        .attr("height", yScale.bandwidth() / 3)
        .attr("fill", "#404080");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    religionGroups.selectAll("rect")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`${d.name}<br>Start: ${d.start}<br>End: ${d.end}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    fetch('religions.json')
        .then(response => response.json())
        .then(data => createTimeline(data))
        .catch(error => console.error('Error loading the JSON data:', error));
});
