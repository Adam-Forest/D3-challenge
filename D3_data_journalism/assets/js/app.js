// D3 Homework - Data Journalism and D3

// create SVG for chart
var svgArea = d3.select("body").select("svg");

// set svg size to window size
var svgWidth = 1080;
var svgHeight = 720;

// choose margin here
var margin = {
    top: 50,
    bottom: 150,
    right: 50,
    left: 150
};

// calculate chart size less margins
var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// *****
// SVG is naturally responsive, just set the viewBox
// No need to redraw the chart every window resize.
// *****

// append SVG element to scatter div
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

// append group element to SVG and move to margin
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(health_data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(health_data, d => d[chosenXAxis]) * 0.8,
        d3.max(health_data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

function yScale(health_data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(health_data, d => d[chosenYAxis]) * 0.8,
        d3.max(health_data, d => d[chosenYAxis]) * 1.2
        ])
        .range([0, height]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}


function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
 
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles text group with a transition to
// new circles text
// function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis)


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, tipGroup) {

    //check x axis
    if (chosenXAxis === "poverty") {
        var label = "In Poverty:";
    } else if (chosenXAxis === "age") {
        var label = "Age (Median):";
    } else if (chosenXAxis === "income") {
        var label = "Household Income (Median):";
    }

    // check y axis
    if (chosenYAxis === 'healthcare') {
        var yLabel = "Lacks Healthcare:"
    }
    //percentage obese
    else if (chosenYAxis === 'obesity') {
        var yLabel = "Obesity:"
    }
    //smoking percentage
    else if (chosenYAxis === 'smokes') {
        var yLabel = "Smokes:"
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);

        });

    tipGroup.call(toolTip);

    tipGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return tipGroup;

}

// read in CSV data
d3.csv("./assets/data/data.csv").then(function (health_data, err) {
    if (err) throw err;

    // cast data, make sure numbers are numbers
    health_data.forEach(function (data) {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.poverty;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(health_data, chosenXAxis);
    var yLinearScale = yScale(health_data, chosenYAxis);

    // Create y scale function
    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(health_data, d => d.healthcare)])
    //     .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);


            //append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(health_data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("opacity", ".8")
        .classed("stateCircle", true);

    var textGroup = chartGroup.selectAll(".stateText")
        .data(health_data)
        .enter()
        .append("text")
        .classed("stateText", "True")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(function (d) { return d.abbr });

    // Create group for  2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("xlabel", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("xlabel", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("xlabel", true)
        .text("Household Income (Median)");

    // **************
    // Create group for y- axis labels
    var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(90)")
            // .attr("y", -5000)
            // .attr("x", -5000)
            .classed("axis-text", true)
        .attr("transform", `translate(${0 - margin.left / 4}, ${(height / 2)}), rotate(90)`);


        
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("ylabel", true)
        .text("Lacks Healthcare (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .classed("ylabel", true)
        .text("Obesity (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .classed("ylabel", true)
        .text("Smokes (%)");
    // ************* 

    // // append y axis
    // chartGroup.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x", 0 - (height / 2))
    //     .attr("dy", "1em")
    //     .classed("axis-text", true)
    //     .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(health_data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circles text with new x values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

                // deactivate all
                d3.selectAll(".xlabel").classed("active", false).classed("inactive", true);

                // activate selected
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(health_data, chosenYAxis);

                // updates x axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates circles text with new x values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);


                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

                // deactivate all
                d3.selectAll(".ylabel").classed("active", false).classed("inactive", true);

                // activate selected
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });


}).catch(function (error) {
    console.log(error);
});

