
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "income";
var chosenYAxis = "obesity";

function yScale(censusData, chosenYAxis) {

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height,0]);

  return yLinearScale;
}


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
    console.log('changing stuff')
  circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    circlesGroup.selectAll('text').transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-6);

    console.log('y: ' + chosenYAxis)
    console.log('x: ' + chosenXAxis)

    circlesGroup.selectAll('circle').transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
    circlesGroup.selectAll('text').transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])-6);

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
    .text("Healthcare");

    var obesityLabel = labelsGroup.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", 0 - (height / 2) -50)
    .attr("y", width/2 + 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity Rate");

    var ageLabel = labelsGroup.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", 0 - (height / 2) -50)
    .attr("y", width/2 + 60)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

console.log(0 - (height / 2))
  // append y axis
//  chartGroup.append("text")
//    .attr("transform", "rotate(-90)")
//    .attr("y", 0 - margin.left)
//    .attr("x", 0 - (height / 2))
//    .attr("dy", "1em")
//    .classed("axis-text", true)
//    .text("Average Obesity Rate");

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



        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
        // updates x axis with transition
        xAxis,yAxis = renderAxes(xLinearScale,yLinearScale, xAxis,yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenYAxis, chosenXAxis);


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }

    });

    ylabelsGroup.selectAll("text")
    .on('click',function(){
        var yvalue = d3.select(this).attr("value");
        console.log('HELLO?????')

        if (yvalue !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = yvalue;


        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        xAxis,yAxis = renderAxes(xLinearScale,yLinearScale, xAxis,yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenYAxis, chosenXAxis);


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text

      }




    });

})