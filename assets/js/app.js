// Creating the initial size of the svg
var svgWidth = 960;
var svgHeight = 500;

// Add a margin
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
// Create the sizes for the chart
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an svg inside the chart object
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Creating the object that all our elements go into
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);


// Create global variables for initial values
var chosenXAxis = "income";
var chosenYAxis = "obesity";
var currentX = "income";
var currentY = 'obesity';
var axisXVal = "Income";
var axisYVal = "Obesity (%)";

// Create the initial value of the title
var chartTitle = d3.select('.chart-title').text('Income v. Obesity (%)')

// Update the y scale based upon given values, called when an axis is clicked
function yScale(censusData, chosenYAxis) {

    // Creating a scaled y axis from the values given
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height,0]);

  return yLinearScale;
}

// Same as the y axis but for the x
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}


// Rendering the axes based upon the given x and y axes passed
// This is intended for when a new axis is called so that the axis transition happens properly
function renderAxes(newXScale,newYScale, xAxis,yAxis) {

  var bottomAxis = d3.axisBottom(newXScale);
  var leftAxis = d3.axisLeft(newYScale)

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis)

    // Returns both changed axes
  return xAxis,yAxis;
}

// Move the circles based upon the changed axis values
function renderCircles(circlesGroup, newXScale, newYScale, chosenYAxis, chosenXAxis) {

    // This function for some reason can only accomdate one of these functions at one time. So an if statement separates them
    // depending upon if the x or y axis is changed.
    // This one updates the X values for the circles and their text
    if (chosenXAxis != currentX){

    circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    circlesGroup.selectAll('text').transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-6);

    currentX = chosenXAxis;
    }

    // Updates the circle and text with the proper y values
    if (chosenYAxis != currentY) {
    circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
    circlesGroup.selectAll('text').transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])-6);

    currentY = chosenYAxis;
    }


  return circlesGroup;
}

// This changes the tool tip based upon the axes selected
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "healthcare") {
    xlabel = "healthcare:";
  }
  else {
    xlabel = "income:";
  }

  if(chosenYAxis == 'obesity'){
    ylabel = 'obesity:'
  }
  else {
    ylabel = 'age:'
  }


    // This creates the tooltip structure and hands it over to css for the formatting
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br> ${ylabel} ${d[chosenYAxis]}`);
    });
// Actually add the tooltip
  circlesGroup.call(toolTip);

// Add the events listener that renders and hides the tooltip object
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data,this);
    });

  return circlesGroup;
}


// Read through the data and make some of the columns numeric
d3.csv("assets/data/data.csv").then(function(censusData) {
  censusData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.age = +data.age
  });

  // Create the linear scale for each axis
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);


  // Create the axis objects
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Add the x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


  // Add the y axis
  var yAxis = chartGroup.append("g")
  .classed('y-axis',true)
  .attr("transform", `translate(0,0)`)
   .call(leftAxis);

  // Create the circle objects and the text objects
  // Circle objects don't render text in d3 so we add text objects and place them on top of the circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append('g')

    circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "green")
    .attr("opacity", ".5")

    circlesGroup.append('text').text(d=>d.abbr)
    .attr('x',d => xLinearScale(d[chosenXAxis]) -6)
    .attr('y',d => yLinearScale(d[chosenYAxis])+4)
    .attr('stroke','white')
    .attr("font-size", "8px");


  // Create the group for all 4 different axes
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Create all 4 of the label objects
    // These are all created in the same way because they're called the same way as one another
  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Average Income");

  var healthcareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lack of Healthcare (%)");

    var obesityLabel = labelsGroup.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", 0 - (height / 2) -50)
    .attr("y", width/2 + 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

    var ageLabel = labelsGroup.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", 0 - (height / 2) -50)
    .attr("y", width/2 + 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Average Age");


  // Add the tooltips
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // Event listener for all axis clicks
  labelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");

    // Grab the current value and store it in either the changed X or Y
      if (value == 'healthcare') {
        chosenXAxis = 'healthcare';
        }

        else if (value == 'income') {
        chosenXAxis = 'income';
        }

        else if (value == 'age') {
        chosenYAxis = 'age';
        }

        else {
        chosenYAxis = 'obesity'
        }

        // Create the X and Y scale based upon the selected axes
        xLinearScale = xScale(censusData, chosenXAxis);
        yLinearScale = yScale(censusData,chosenYAxis);

        // Render the axis transitions
        xAxis,yAxis = renderAxes(xLinearScale,yLinearScale, xAxis,yAxis);


        // Update the circles with their new positions
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenYAxis, chosenXAxis);

        // Update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Changes the appearance of the axis labels
        if (chosenXAxis === "income") {
            axisXVal = "Income";

          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            axisXVal = "Lack of Healthcare (%)";
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }

        if (chosenYAxis === "obesity") {
            axisYVal = "Obesity (%)";
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            axisYVal = "Average Age";
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        // Change the chart title if a new axis is selected
        chartTitle = d3.select('.chart-title').text(`${axisXVal} v. ${axisYVal}`)

    });

})