 $(document).ready(function() {
     var url = 'https://spreadsheets.google.com/feeds/list/1j17ANt3kBna-uU4CiQ0Tbcx7esPVzJ_YAy5x1C9pazY/1/public/basic?alt=json';
     $.get(url, function(json, status) {
         var input = json.feed.entry;
         var columns = ['companyname', 'jobtitle', 'jobcategory', 'salary', 'state', 'industry', 'year'];
         var json = [];
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
             if (typeof row.invalid =='undefined') {
                json.push(row);
             }
             
         }
         for (var m in columns) {
             $('thead>tr').append('<th>' + columns[m] + '</th>');
         }
         for (var k in json) {
             $('tbody').append('<tr class="' + k + '"></tr>');
             for (var l in json[k]) {
                 $('tr.' + k).append('<td>' + json[k][l] + '</td>');
             }
         }

         var usChart = dc.geoChoroplethChart("#us-chart");
         console.log(json.length);
         var data = crossfilter(json);

         var states = data.dimension(function(d) {
             return d.state;
         });

         var stateSalary = states.group().reduceSum(function(d) {
             return d.salary;
         });

         d3.json("../data/us-states.json", function(statesJson) {
             usChart.width(990)
                 .height(500)
                 .dimension(states)
                 .group(stateSalary)
                 .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                 /*.colorDomain([0, 3650700])*/
                 .colorCalculator(function(d) {
                     return d ? usChart.colors()(d/5079688) : '#ccc';
                 })
                 .overlayGeoJson(statesJson.features, "state", function(d) {
                     return d.properties.name;
                 })
                 .title(function(d) {
                     return "State: " + d.key + "\nTotal Salary: " + d.value;
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

     });
 });
