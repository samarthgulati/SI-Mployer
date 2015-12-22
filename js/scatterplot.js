scatterplot = {
	graphObjects : {},

	createGraph:function(){
		var margin = {
			top: 20,
			right: 0,
			bottom: 30,
			left: 80
		},
		width = window.outerWidth / 1.1 - margin.left - margin.right,
		height = window.outerHeight / 2.25 - margin.top - margin.bottom,
		legendWidth = 150;

        /* 
         * value accessor - returns the value to encode for a given data object.
         * scale - maps value to a visual display encoding, such as a pixel position.
         * map function - maps from data value to display value
         * axis - sets up axis
         */

        // setup x 
        var xValue = function(d) {
        	return d.state.trim();
            }, // data -> value
            xScale = d3.scale.ordinal().rangeRoundBands([0, width - legendWidth], 1), // value -> display

            xMap = function(d) {
            	return xScale(xValue(d));
            }, // data -> display
            xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        //xAxis.tickValues();

        // setup y
        var yValue = function(d) {
        	return d.salary;
            }, // data -> value
            salaryMap = scatterJson.map(function(d) {
            	return d.salary.trim();
            }),
            yScale = d3.scale.linear().range([height, 0]), // value -> display
            yMap = function(d) {
            	return yScale(yValue(d));
            }, // data -> display
            yAxis = d3.svg.axis().scale(yScale).orient("left");


        // add the graph canvas to the body of the webpage

        var svg = d3.select("#salary").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // add the tooltip area to the webpage
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        // don't want dots overlapping axis, so add in buffer to data domain
        xScale.domain(statesW2E);

        var salaryMax = parseInt(d3.max(scatterJson, yValue));
        yScale.domain([0, salaryMax + 100000]);

        var lol = function(data){
        	console.log(this);
        };

        

        // x-axis
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width - legendWidth)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("States");
        svg.select(".x.axis")
        .selectAll("text")
            //.attr("transform", " translate(0,15) rotate(-65)") // To rotate the texts on x axis. Translate y position a little bit to prevent overlapping on axis line.
            .style("font-size", "9px"); //To change the font size of texts

        // y-axis
        svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Salary");

        // draw dots
        var dots = svg.selectAll(".dot")
        .data(scatterJson)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) {
        	return colorJobCategory(d.jobcategory);
        })
        .on("mouseover", function(d) {
        	tooltip.transition()
        	.duration(200)
        	.style("opacity", .9);
        	tooltip.html(d.jobtitle + "<br/> (" + xValue(d) + ", $" + yValue(d) + ")")
        	.style("left", (d3.event.pageX + 5) + "px")
        	.style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
        	tooltip.transition()
        	.duration(500)
        	.style("opacity", 0);
        });

        // draw legend
        var legend = svg.selectAll(".legend")
        .data(cJobCategory.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
        	return "translate(0," + i * 20 + ")";
        });

        // draw legend colored rectangles
        legend.append("rect")
        .attr("x", width - legendWidth + 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", cJobCategory);

        // draw legend text
        legend.append("text")
        .attr("x", width - legendWidth + 32)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .attr("font-size", "11px")
        .text(function(d) {
        	return d;
        });

        this.graphObjects.dots = dots;
        this.graphObjects.salaryMax = salaryMax;


        $("#salarySlider").slider({
        	min:0,
        	max:salaryMax+100000,
        	values:[0,salaryMax+100000],
        	slide:this.handleEvent
        });
    },

    handleEvent:function(event, ui){
    	$( "#salaryRange" ).text( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
    	var filterItem = {"row": null, "selection":[ui.values[0], ui.values[1]], "type":"salary", "parent":null, "parenttype":null};
    	scatterplot.addFilter(filterItem);
    	treemap.addFilter(filterItem);
    	circlePacking.addFilter(filterItem);
    	CoLMap.addFilter(filterItem);
        if (ui.values[0] ==0 && ui.values[1]==(scatterplot.graphObjects.salaryMax+100000)){
            decrementGlobalFilter(filterItem.type);
            scatterplot.removeFilter(filterItem);
            treemap.removeFilter(filterItem);
            circlePacking.removeFilter(filterItem);
            CoLMap.removeFilter(filterItem);
        }else{
            incrementGlobalFilter(filterItem.type);
        }
    },

    addFilter:function(data){
    	if (data.type==='salary'){
    		this.graphObjects.dots.filter(function(d){
    			if (containsInFilterArray(d,data.type)){
    				return d;
    			}
    		}).attr("class", function(d){
    			removeFromFilterArray(d, data.type);
    			return changeClasses(d,this);
    		})
    	}
    	var selection = this.graphObjects.dots.filter(function(d){
    		if (typeof d!='undefined'){	
    			var found = false;
    			switch(data.type){
    				case "jobtitle":
    				if (data.selection === d[data.type]){
    					found = true;
    				}
    				break;
    				case "state":
    				if (data.selection === d[data.type]){
    					found = true;
    				}
    				break;
    				case "companyname":
    				if (data.selection === d[data.type]){
    					found = true;
    				}
    				break;
    				case "salary":
    				if (data.selection.length==2 && data.selection[0] <= d[data.type] && data.selection[1] >= d[data.type]){
    					found = true;
    				}
    				break;
    			}

    			if (found){
    				d.filterCount++;
    				addToFilterArray(d, data.type);
    				return d;
    			}
    		}
    	}).attr("class", function(d){
    		return changeClasses(d, this);
    	});
    	//selection.classed("selected", true);
    },
    removeFilter:function(data){
    	var selection = this.graphObjects.dots.filter(function(d){
    		if (typeof d!='undefined'){
    			var found = false;
    			switch(data.type){
    				case "jobtitle":
                   if (data.selection === d[data.type]){
                      found = true;
                  }
                  break;
                  case "state":
                  if (data.selection === d[data.type]){
                      found = true;
                  }
                  break;
                  case "companyname":
                  if (data.selection === d[data.type]){
                      found = true;
                  }
                  break;
                  case "salary":
                  if (data.selection.length==2 && data.selection[0] <= d[data.type] && data.selection[1] >= d[data.type]){
                    found = true;
                }
                break;
            }

            if (found){
                d.filterCount--;
                removeFromFilterArray(d, data.type);
                return d;
            }
        }
    }).attr("class", function(d){
      return changeClasses(d, this);
  });
}

}