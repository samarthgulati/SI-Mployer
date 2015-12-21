treeMapHeirarchy = ['jobcategory','jobtitle'];
treeMapJson = {"name":"root", "children" : []};
circlePackHeirarchy = ['companyfunding','companyname'];
circlepackingJson = {"name":"root", "children" : []};
treeFilter = [];


function position() {
  this.style("left", function(d) { return d.x + "px"; })
  .style("top", function(d) { return d.y + "px"; })
  .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
  .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function incrementCounter(jsonList, itemToFind, row){
  var itemFound = false;
  $.each(jsonList, function(key, value){
    if (typeof value.name != undefined && value.name == itemToFind){
      value.count++;
      itemFound = true;
    }
  });

  if (!itemFound){
    jsonList.push({"name": itemToFind, "count":1, "row": row, "selected": false, "filterCount":0});
  }
}

function addIfNotPresent(jsonList, itemToFind, row){
  var itemFound = false;
  var location = 0;
  $.each(jsonList, function(key, value){
    if (typeof value.name != undefined && value.name == itemToFind){
      itemFound = true;
      location = key;
    }
  });

  if (!itemFound){
    var length = jsonList.push({"name": itemToFind, "children":[], "row": row, "selected": false, "filterCount":0 });
    location = length-1;
  }

  return location;
}


$(document).ready(function() {
 var columns = ['id', 'companyname', 'jobtitle', 'jobcategory', 'salary', 'infladj15', 'state', 'industry', 'companyfunding', 'year'];
 var statesW2E = ['HI', 'AK', 'OR', 'WA', 'CA', 'NV', 'ID', 'AZ', 'MT', 'UT', 'NM', 'CO', 'WY', 'ND', 'SD', 'TX', 'OK', 'NE', 'KS', 'IA', 'MN', 'AR', 'MO', 'LA', 'MS', 'IL', 'WI', 'TN', 'AL', 'IN', 'KY', 'MI', 'GA', 'FL', 'OH', 'WV', 'SC', 'NC', 'VA', 'DC', 'PA', 'MD', 'DE', 'NJ', 'NY', 'CT', 'VT', 'NH', 'RI', 'MA', 'ME', 'Intl'];
 var col = [],
 json = [],
 usJson = {};
 var selected = {};
 selected.states = statesW2E;
 selected.jobtitles = [];
 selected.salaryRange = [];
 selected.companies = [];

 var getUrlData = function(url) {
   return $.ajax({
     url: url,
     type: 'GET',
     async: false,
     dataType: 'json'
   });
 };

 var getData = function() {
   var dataUrl = 'https://spreadsheets.google.com/feeds/list/1j17ANt3kBna-uU4CiQ0Tbcx7esPVzJ_YAy5x1C9pazY/1/public/basic?alt=json';
   var colUrl = 'data/col.json';
   var usUrl = 'data/us-states.json';
   getUrlData(dataUrl).done(function(data) {
     var input = data.feed.entry;
     for (var i in input) {
       var row = {};
       for (var j = 0; j < columns.length; j++) {
         if (j != columns.length - 1) {
           row[columns[j]] = input[i].content.$t.split(columns[j] + ': ')[1];
           row[columns[j]] = row[columns[j]].split(', ' + columns[j + 1] + ': ')[0];
         } else {
           row[columns[j]] = input[i].content.$t.split(columns[j] + ': ')[1];
         }
         if (row[columns[j]].toUpperCase() == 'N/A') {
           row.invalid = true;
         }
       }
       if (typeof row.invalid == 'undefined') {
         row['stateLoc'] = statesW2E.indexOf(row.state) + 1;
         if (row['stateLoc'] === 0) row['stateLoc'] = statesW2E.length + 2;
         var positionTreeList = addIfNotPresent(treeMapJson.children, row[treeMapHeirarchy[0]], row);
         incrementCounter(treeMapJson.children[positionTreeList].children, row[treeMapHeirarchy[1]], row);
         var positionCircleList = addIfNotPresent(circlepackingJson.children, row[circlePackHeirarchy[0]], row);
         incrementCounter(circlepackingJson.children[positionCircleList].children, row[circlePackHeirarchy[1]], row);
         json.push(row);
       }
     }
   });
getUrlData(colUrl).done(function(data) {
 col = data;
});
getUrlData(usUrl).done(function(data) {
 usJson = data;
});

var loading = setInterval(function() {
 if (col.length > 0 && json.length > 0 && usJson.length > 0) {
   clearInterval(loading);
   return;
 }
}, 500);
};

getData();

     /*var arrayDiff = function(a1, a2) {
         return a1.filter(function(i) {
             return a2.indexOf(i) < 0;
         });
};*/

var updateVis = function() {

 if (selected.states.length === statesW2E.length) {

   unselectedStates = [];
   $('.state.unselected').attr('class', function(i, val) {
     return val.replace('unselected', 'selected');
   });

 } else {

   $('.state.selected').attr('class', function(i, val) {
     return val.replace('selected', 'unselected');
   });

   for (var s in selected.states) {

     $('.state.unselected.' + selected.states[s]).attr('class', function(i, val) {
       return val.replace('unselected', 'selected');
     });
   }
 }

};

var drawCoLMap = function() {
         var mapRatio = 1.6, // w/h
         mapWidth, mapHeight;
         if (window.outerWidth > window.outerHeight) {
           mapWidth = (window.outerHeight * mapRatio) / 2.1;
           mapHeight = window.outerHeight / 2.1;
         } else {
           mapWidth = window.outerWidth / 2.1;
           mapHeight = window.outerWidth / (2.1 * mapRatio);
         }

         var idx = col.map(function(d) {
           return d.index;
         });

         var quantize = d3.scale.quantize()
         .domain([d3.min(idx), d3.max(idx)])
         .range(colorbrewer['Blues'][9]);

         var scaleRatio = 4 / 3; //scale/width

         var projection = d3.geo.albersUsa()
         .scale(scaleRatio * mapWidth)
         .translate([mapWidth / 2, mapHeight / 2]);

         var path = d3.geo.path()
         .projection(projection);

         var svg = d3.select("#location").append("svg")
         .attr("width", mapWidth)
         .attr("height", mapHeight);

         var stateIdx = {};
         col.map(function(d) {
           stateIdx[d.code] = JSON.parse(JSON.stringify(d));
         });

         var states = svg.append("g")
         .attr("id", "states");
         states.selectAll("path")
         .data(usJson.features)
         .enter().append("path")

         .attr("d", path)
         .attr("fill", function(d) {
           return quantize(stateIdx[d.properties.name].index);
         })
         .attr("class", function(d) {
           return d.properties.name + ' state selected';
         })
         .on("click", handleMapStateSelect)
         .append("svg:title")
         .text(function(d) {
           return stateIdx[d.properties.name].state;
         });
       };
       var drawSalaryPlot = function() {

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
           return d.state;
             }, // data -> value
             xScale = d3.scale.ordinal().rangeRoundBands([0, width - legendWidth],1), // value -> display

             xMap = function(d) {
               return xScale(xValue(d));
             }, // data -> display
             xAxis = d3.svg.axis().scale(xScale).orient("bottom");
         //xAxis.tickValues();

         // setup y
         var yValue = function(d) {
           return d.salary;
             }, // data -> value
             salaryMap = json.map(function(d) {
               return d.salary;
             }),
             yScale = d3.scale.linear().range([height, 0]), // value -> display
             yMap = function(d) {
               return yScale(yValue(d));
             }, // data -> display
             yAxis = d3.svg.axis().scale(yScale).orient("left");

         // setup fill color
         var cValue = function(d) {
           return d.jobcategory;
         };
         var color = d3.scale.category20();

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
         yScale.domain([0, parseInt(d3.max(json, yValue)) + 100000]);

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
         svg.selectAll(".dot")
         .data(json)
         .enter().append("circle")
         .attr("class", "dot")
         .attr("r", 3.5)
         .attr("cx", xMap)
         .attr("cy", yMap)
         .style("fill", function(d) {
           return color(cValue(d));
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
         .data(color.domain())
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
         .style("fill", color);

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

       };


       var handleMapStateSelect = function(e) {
         if (selected.states.length === statesW2E.length) {
           selected.states = [e.properties.name];
         } else {

           if (selected.states.indexOf(e.properties.name) > -1) {
             selected.states.splice(selected.states.indexOf(e.properties.name), 1);
             if (selected.states.length === 0) {
               selected.states = statesW2E;
             }
           } else {
             selected.states.push(e.properties.name);
           }
         }

         updateVis();
       };

       drawCoLMap();
       drawSalaryPlot();
       circlePacking.createGraph(460);
       treemap.createGraph();

    });
