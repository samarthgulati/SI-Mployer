 $(document).ready(function() {
     var columns = ['companyname', 'jobtitle', 'jobcategory', 'salary', 'state', 'industry', 'year'];
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
                     if (row[columns[j]] == 'N/A' || row[columns[j]] == 'n/a') {
                         row.invalid = true;
                     }
                 }
                 if (typeof row.invalid == 'undefined') {
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

     var usChart = dc.geoChoroplethChart("#us-chart");

     var data = crossfilter(col);

     var states = data.dimension(function(d) {
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
         })]).range(['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b']))
         .colorCalculator(function(d) {
             return d ? usChart.colors()(d) : '#ccc';
         })
         .overlayGeoJson(statesJson.features, "state", function(d) {
             return d.properties.name;
         })
         .title(function(d) {
             return "State: " + d.key + "\nCoL Index: " + d.value;
         });
     /*industryChart.width(990)
          .height(200)
          .margins({
              top: 10,
              right: 50,
              bottom: 30,
              left: 60
          })
          .dimension(industries)
          .group(statsByIndustries)
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
          .r(d3.scale.linear().domain([0, 4000]))
          .minRadiusWithLabel(15)
          .elasticY(true)
          .yAxisPadding(100)
          .elasticX(true)
          .xAxisPadding(200)
          .maxBubbleRelativeSize(0.07)
          .renderHorizontalGridLines(true)
          .renderVerticalGridLines(true)
          .renderLabel(true)
          .renderTitle(true)
          .title(function(p) {
              return p.key + "\n" + "Amount Raised: " + numberFormat(p.value.amountRaised) + "M\n" + "Number of Deals: " + numberFormat(p.value.deals);
          });
      industryChart.yAxis().tickFormat(function(s) {
          return s + " deals";
      });
      industryChart.xAxis().tickFormat(function(s) {
          return s + "M";
      });

      roundChart.width(990)
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
