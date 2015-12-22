statesW2E = ['HI', 'AK', 'OR', 'WA', 'CA', 'NV', 'ID', 'AZ', 'MT', 'UT', 'NM', 'CO', 'WY', 'ND', 'SD', 'TX', 'OK', 'NE', 'KS', 'IA', 'MN', 'AR', 'MO', 'LA', 'MS', 'IL', 'WI', 'TN', 'AL', 'IN', 'KY', 'MI', 'GA', 'FL', 'OH', 'WV', 'SC', 'NC', 'VA', 'DC', 'PA', 'MD', 'DE', 'NJ', 'NY', 'CT', 'VT', 'NH', 'RI', 'MA', 'ME', 'Intl'];
treeMapHeirarchy = ['jobcategory', 'jobtitle'];
treeMapJson = {
    "name": "root",
    "children": []
};
circlePackHeirarchy = ['companyfunding', 'companyname'];
circlepackingJson = {
    "name": "root",
    "children": []
};
treeFilter = [];
mapDictionary = {};
mapJson = [];
scatterJson = [];
var selected = {};
selected.states = statesW2E;
selected.jobtitles = [];
selected.salaryRange = [];
selected.companies = [];


function position() {
    this.style("left", function(d) {
        return d.x + "px";
    })
    .style("top", function(d) {
        return d.y + "px";
    })
    .style("width", function(d) {
        return Math.max(0, d.dx - 1) + "px";
    })
    .style("height", function(d) {
        return Math.max(0, d.dy - 1) + "px";
    });
}


function incrementCounter(jsonList, itemToFind, row){
  var itemFound = false;
  $.each(jsonList, function(key, value){
    if (typeof value.name != undefined && value.name == itemToFind){
      value.count++;
      value.row.push(row)
      itemFound = true;
  }
});

  if (!itemFound){
    jsonList.push({"name": itemToFind, "count":1, "row": [row], "selected": false, "filterCount":0, "filters":[]});
}
}

function addIfNotPresent(jsonList, itemToFind, row) {
    var itemFound = false;
    var location = 0;
    $.each(jsonList, function(key, value) {
        if (typeof value.name != undefined && value.name == itemToFind) {
            itemFound = true;
            location = key;
        }
    });
    if (!itemFound){
        var length = jsonList.push({"name": itemToFind, "children":[], "row": [row], "selected": false, "filterCount":0, "filters":[]});
        location = length-1;
    }
    return location;
}

function createMapDictionary(usJson, col){
    for (var i=0;i<usJson.features.length;i++){
        var state = usJson.features[i].properties.name;
        mapDictionary[state] = {};
        mapDictionary[state].code = usJson.features[i].properties.name;
        mapDictionary[state].geometry = usJson.features[i].geometry;
        mapDictionary[state].id = usJson.features[i].id;
        mapDictionary[state].properties = usJson.features[i].properties;
        mapDictionary[state].type = usJson.features[i].type;
    }
    for (var i=0;i<col.length;i++){
        var state = col[i].code;
        mapDictionary[state].index = col[i].index;
        mapDictionary[state].longitude = col[i].longitude;
        mapDictionary[state].rank = col[i].rank;
        mapDictionary[state].fullname = col[i].state;
        mapDictionary[state].row = [];
        mapDictionary[state].filterCount = 0;
        mapDictionary[state].filters = [];
    }
    /*mapDictionary["Intl"] = {};
    mapDictionary["Intl"].code = "Intl";
    mapDictionary["Intl"].geometry = null;
    mapDictionary["Intl"].id = null;
    mapDictionary["Intl"].index = null;
    mapDictionary["Intl"].longitude = null;
    mapDictionary["Intl"].rank =null;
    mapDictionary["Intl"].fullname = "International";
    mapDictionary["Intl"].row = [];*/
}

function createMapData(){
    for (var i=0;i<statesW2E.length;i++){
        var state = statesW2E[i];
        if (state!="Intl"){
            mapJson.push(mapDictionary[state]);
        }
    }
}



$(document).ready(function() {
    var columns = ['id', 'companyname', 'jobtitle', 'jobcategory', 'salary', 'infladj15', 'state', 'industry', 'companyfunding', 'year'];
    
    var col = [],
    json = [],
    usJson = {};


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
        getUrlData(colUrl).done(function(data) {
            col = data;
        });
        getUrlData(usUrl).done(function(data) {
            usJson = data;
        });
        createMapDictionary(usJson,col);
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
                    if (row["state"].trim()!="Intl"){                        
                        mapDictionary[row["state"].trim()].row.push(row);    
                    }
                    
                    row['stateLoc'] = statesW2E.indexOf(row.state) + 1;
                    if (row['stateLoc'] === 0) row['stateLoc'] = statesW2E.length + 2;
                    var positionTreeList = addIfNotPresent(treeMapJson.children, row[treeMapHeirarchy[0]], row);
                    incrementCounter(treeMapJson.children[positionTreeList].children, row[treeMapHeirarchy[1]], row);
                    var positionCircleList = addIfNotPresent(circlepackingJson.children, row[circlePackHeirarchy[0]], row);
                    incrementCounter(circlepackingJson.children[positionCircleList].children, row[circlePackHeirarchy[1]], row);
                    row.filterCount = 0;
                    row.filters = [];
                    json.push(row);
                }
            }
            scatterJson = json;
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
};
*/


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






    //drawCoLMap();
    //drawSalaryPlot();
    createMapData(usJson,col);
    scatterplot.createGraph();
    CoLMap.createGraph();
    circlePacking.createGraph(460);
    treemap.createGraph();

});
