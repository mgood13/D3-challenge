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



function renderAxes(newXScale,newYScale, xAxis,yAxis) {

  var bottomAxis = d3.axisBottom(newXScale);
  var leftAxis = d3.axisLeft(newYScale)

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis)

  return xAxis,yAxis;
}

function renderCircles(circlesGroup, newXScale, newYScale, chosenYAxis, chosenXAxis) {

    if (chosenXAxis != currentX){

    circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    circlesGroup.selectAll('text').transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-6);

    currentX = chosenXAxis;
    }



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



  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br> ${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
  })
    .on("mouseout", function(data, index) {
      toolTip.hide(data,this);
    });

  return circlesGroup;
}



d3.csv("assets/data/data.csv").then(function(censusData) {
  censusData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.age = +data.age
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create y scale function
//  var yLinearScale = d3.scaleLinear()
//    .domain([0, d3.max(censusData, d => d.obesity)])
//    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


  // append y axis
  var yAxis = chartGroup.append("g")
  .classed('y-axis',true)
  .attr("transform", `translate(0,0)`)
   .call(leftAxis);

  // append initial circles
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


  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g")
  .attr("transform",`translate(0, ${height/2})`);

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


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");


      if (value == 'healthcare') {

        // replaces chosenXAxis with value
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

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
        yLinearScale = yScale(censusData,chosenYAxis);
        // updates x axis with transition
        xAxis,yAxis = renderAxes(xLinearScale,yLinearScale, xAxis,yAxis);


        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenYAxis, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
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

        chartTitle = d3.select('.chart-title').text(`${axisXVal} v. ${axisYVal}`)

    });

})