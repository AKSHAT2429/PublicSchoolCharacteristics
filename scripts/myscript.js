d3.csv("https://raw.githubusercontent.com/SahilBhave/PublicSchoolCharacteristics/main/Data/Public_School_Characteristics_2020-21.csv").then(function(data) {
  // Extract unique localities and school levels
  var localities = Array.from(new Set(data.map(function(d) { return d.NewULOCALE; })));
  var schoolLevels = Array.from(new Set(data.map(function(d) { return d.SCHOOL_LEVEL; })));

  var customOrder = ["Prekindergarten","Elementary", "Middle","Secondary", "High", "Adult Education"];

  var colorScale = d3.scaleOrdinal()
    .domain(customOrder)
    .range(d3.schemeCategory10);

  // Create a dropdown for localities
  var localityDropdown = d3.select("#chart2")
    .append("select")
    .attr("id", "localityDropdown")
    .on("change", updateChart);

  localityDropdown.selectAll("option")
    .data(localities)
    .enter().append("option")
    .text(function(d) { return d; });

  // Create SVG container for the chart
  var width = 700; // Adjust the width based on your needs
  var height = 500; // Adjust the height based on your needs

  var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Initial chart setup
  updateChart();

  function updateChart() {
    // Get the selected locality
    var selectedLocality = d3.select("#localityDropdown").node().value;

    var excludedCategories = ["Other", "Ungraded","Not Applicable","Not Reported"]

    // Filter data based on the selected locality
    var filteredData = data.filter(function(d) {
      return d.NewULOCALE === selectedLocality && !excludedCategories.includes(d.SCHOOL_LEVEL)
    });

    // Group data by school level
    var nestedData = d3.rollup(
      filteredData,
       v => ({
        count: v.length,
        color: colorScale(v[0].SCHOOL_LEVEL) // Map school level to color
      }),
      d => d.SCHOOL_LEVEL
    );

    // Set up chart dimensions
    var margin = { top: 20, right: 20, bottom: 170, left: 80 }; // Increased bottom margin for rotated labels

    // Clear previous chart
    svg.selectAll("*").remove();

    // Create scales
    var x = d3.scaleBand()
      .range([0, width - margin.left - margin.right])
      .padding(0.1)
      .domain(customOrder.filter(level => !excludedCategories.includes(level)));

    var y = d3.scaleLinear()
      .range([height - margin.top - margin.bottom, 0])
      .domain([0, d3.max(Array.from(nestedData.values()), d => d.count)]);

    // Create bars
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .selectAll(".bar")
      .data(Array.from(nestedData))
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d[0]); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d[1].count); })
      .attr("height", function(d) { return height - margin.top - margin.bottom - y(d[1].count); })
      .attr("fill", function(d) { return d[1].color; });
    // Add x-axis with rotated labels
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add y-axis
    svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(d3.axisLeft(y));

  svg.append("text")
  .attr("x", width/2)
  .attr("y", height -80) // Adjust the vertical position
  .style("text-anchor", "middle")
  .style("fill", "black") // Set the color to blue
  .text("School Level");

    // Add y-axis label
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y",margin.left-20)
  .attr("x",0 - (height / 2) + 40)
  .attr("dy", "-2em") // Adjust the vertical position
  .style("text-anchor", "middle")
  .style("fill", "black") // Set the color to blue
  .text("School Count");

// Move the chart area to make space for the y-axis label
svg.attr("transform", "translate(" + (margin.left + 20) + "," + margin.top + ")");

  }
});
