 var treeMapHeirarchy = ['jobcategory','jobtitle'];
 var treeMapJson = {"name":"root", "children" : []};


 function position() {
  this.style("left", function(d) { return d.x + "px"; })
  .style("top", function(d) { return d.y + "px"; })
  .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
  .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

function incrementCounter(jsonList, itemToFind){
  var itemFound = false;
  $.each(jsonList, function(key, value){
    if (typeof value.name != undefined && value.name == itemToFind){
      value.count++;
      itemFound = true;
  }
});

  if (!itemFound){
    jsonList.push({"name": itemToFind, "count":1});
}
}

function addIfNotPresent(jsonList, itemToFind){
  var itemFound = false;
  var location = 0;
  $.each(jsonList, function(key, value){
    if (typeof value.name != undefined && value.name == itemToFind){
      itemFound = true;
      location = key;
  }
});

  if (!itemFound){
    var length = jsonList.push({"name": itemToFind, "children":[]});
    location = length-1;
}

return location;
}

$(document).ready(function() {
 var columns = ['id', 'companyname', 'jobtitle', 'jobcategory', 'salary', 'infladj15', 'state', 'industry', 'year'];
 var statesW2E = ['HI', 'AK', 'OR', 'WA', 'CA', 'NV', 'ID', 'AZ', 'MT', 'UT', 'NM', 'CO', 'WY', 'ND', 'SD', 'TX', 'OK', 'NE', 'KS', 'IA', 'MN', 'AR', 'MO', 'LA', 'MS', 'IL', 'WI', 'TN', 'AL', 'IN', 'KY', 'MI', 'GA', 'FL', 'OH', 'WV', 'SC', 'NC', 'VA', 'DC', 'PA', 'MD', 'DE', 'NJ', 'NY', 'CT', 'VT', 'NH', 'RI', 'MA', 'ME'];
 var col = [],
 json = [],
 statesJson = {};

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
     var statesUrl = 'data/us-states.json';
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
                var positionList = addIfNotPresent(treeMapJson.children, row[treeMapHeirarchy[0]]);
                incrementCounter(treeMapJson.children[positionList].children, row[treeMapHeirarchy[1]]);
                row['stateLoc'] = statesW2E.indexOf(row.state) + 1;
                if (row['stateLoc'] === 0) row['stateLoc'] = statesW2E.length + 2;
                json.push(row);
            }
        }
    });
 getUrlData(colUrl).done(function(data) {
     col = data;
 });
 getUrlData(statesUrl).done(function(data) {
     statesJson = data;
 });

 var loading = setInterval(function() {
     if (col.length > 0 && json.length > 0 && statesJson.length > 0) {
         clearInterval(loading);
         return;
     }
 }, 500);
};

getData();

     /*for (var m in columns) {
         $('thead>tr').append('<th>' + columns[m] + '</th>');
     }
     for (var k in json) {
         $('tbody').append('<tr class="' + k + '"></tr>');
         for (var l in json[k]) {
             $('tr.' + k).append('<td>' + json[k][l] + '</td>');
         }
     }*/

     var margin = {top: 40, right: 10, bottom: 10, left: 10},
       width = 960 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;

       var color = d3.scale.category20c();

       var treemap = d3.layout.treemap()
       .size([width, height])
       .sticky(true)
       .value(function(d) { 
        return d.count; 
      });

       var div = d3.select("#treemap").append("div")
       .style("position", "relative")
       .style("width", (width + margin.left + margin.right) + "px")
       .style("height", (height + margin.top + margin.bottom) + "px")
       .style("left", margin.left + "px")
       .style("top", margin.top + "px");

       // Define the div for the tooltip
       var tooldiv = d3.select("body").append("div") 
       .attr("class", "tool")       
       .style("opacity", 0);

       var node = div.datum(treeMapJson).selectAll(".node")
       .data(treemap.nodes)
       .enter().append("div")
       .attr("class", "node")
       .on('mouseover', function(d,i){
        tooldiv.transition()    
        .duration(200)    
        .style("opacity", .9);  
        tooldiv.html("<b>"+d.name+"</b></br>People: "+d.count+"</br>Category: "+d.parent.name)  
        .style("left", (d3.event.pageX+50) + "px")   
        .style("top", (d3.event.pageY+25) + "px");

        console.log(d3.event.pageX + ", " + d3.event.pageY);
      })
       .on("mouseout", function(d) {   
        tooldiv.transition()    
        .duration(500)    
        .style("opacity", 0); 
      })
       .call(position)
       .style("background", function(d) { return d.children ? color(d.name) : null; })
       .text(function(d) { return d.children ? null : d.name; });



     var usChart = dc.geoChoroplethChart("#us-chart");

     var states_data = crossfilter(col);

     var states = states_data.dimension(function(d) {
         return d.code;
     });

     var stateIndex = states.group().reduceSum(function(d) {
         return d.index;
     });



     usChart.width(990)
     .height(500)
     .dimension(states)
     .group(stateIndex)
     .colors(d3.scale.quantize().domain([d3.min(col, function(d) {
         return d.index;
     }), d3.max(col, function(d) {
         return d.index;
     })]).range(['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']))
     .colorCalculator(function(d) {
         return d ? usChart.colors()(d) : '#ccc';
     })
     .overlayGeoJson(statesJson.features, "state", function(d) {
         return d.properties.name;
     })
     .title(function(d) {
         return "State: " + d.key + "\nCoL Index: " + d.value;
     });
     //console.log(json);
     var salartyChart = dc.seriesChart("#industry-chart");
     var cdo_data = crossfilter(json);
     var cdo_state = cdo_data.dimension(function(d) {
         return [d.stateLoc, d.salary, d.jobcategory];
     });
     var cdo_salary = cdo_state.group();
     var subChart = function(c) {
         return dc.scatterPlot(c)
         .symbolSize(8)
         .highlightedSize(10);
     };


     /* var cdo_salary = cdo_id.group().reduce(
         function(p, v) {
             p.state = v.stateLoc;
             p.salary = v.salary;
             return p;
         },
         function(p, v) {
             p.state = v.state;
             p.salary = v.salary;
             return p;
         },
         function(p, v) {
             p.state = '';
             p.salary = 0;
             return p;
         });
 */
     /*salartyChart.width(1280)
         .height(400)
         .margins({
             top: 10,
             right: 50,
             bottom: 30,
             left: 60
         })
         .dimension(cdo_state)
         .group(cdo_salary)
         .y(d3.scale.linear().domain([0, 170000]))
         .x(d3.scale.linear().domain([0, 53]))
         .brushOn(false)
         .symbolSize(5)
         .clipPadding(10)
         .yAxisLabel('Salary (in USD)');
         console.log(salartyChart.data());*/

         salartyChart
         .width(1140)
         .height(window.outerHeight/2.2)
         .margins({
             top: 10,
             right: 50,
             bottom: 30,
             left: 60
         })
         .chart(subChart)
         .y(d3.scale.linear().domain([0, 170000]))
         .x(d3.scale.linear().domain([0, 53]))
         .brushOn(true)
         .yAxisLabel('Salary (in USD)')
         .xAxisLabel('States')
         .clipPadding(10)
         //.elasticY(true)
         .dimension(cdo_state)
         .group(cdo_salary)
         .mouseZoomable(false)
         .seriesAccessor(function(d) {
             return d.key[2];
         })
         .keyAccessor(function(d) {
             return d.key[0];
         })
         .valueAccessor(function(d) {
             return d.key[1];
         });
         //.legend(dc.legend().x(350).y(350).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));
     /*industryChart.yAxis().tickFormat(function(s) {
         return s + " deals";
     });*/
     /*industryChart.xAxis().tickFormat(function(s) {
         return s + "M";
     });*/

     /* roundChart.width(990)
          .height(200)
          .margins({
              top: 10,
              right: 50,
              bottom: 30,
              left: 60
          })
          .dimension(rounds)
          .group(statsByRounds)
          .colors(d3.scale.category10())
          .keyAccessor(function(p) {
              return p.value.amountRaised;
          })
          .valueAccessor(function(p) {
              return p.value.deals;
          })
          .radiusValueAccessor(function(p) {
              return p.value.amountRaised;
          })
          .x(d3.scale.linear().domain([0, 5000]))
          .r(d3.scale.linear().domain([0, 9000]))
          .minRadiusWithLabel(15)
          .elasticY(true)
          .yAxisPadding(150)
          .elasticX(true)
          .xAxisPadding(300)
          .maxBubbleRelativeSize(0.07)
          .renderHorizontalGridLines(true)
          .renderVerticalGridLines(true)
          .renderLabel(true)
          .renderTitle(true)
          .title(function(p) {
              return p.key + "\n" + "Amount Raised: " + numberFormat(p.value.amountRaised) + "M\n" + "Number of Deals: " + numberFormat(p.value.deals);
          });
      roundChart.yAxis().tickFormat(function(s) {
          return s + " deals";
      });
      roundChart.xAxis().tickFormat(function(s) {
          return s + "M";
      });*/

 dc.renderAll();
});
