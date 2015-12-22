CoLMap = {
    graphObjects:{},

    createGraph: function() {
            var mapRatio = 1.6, // w/h
            mapWidth, mapHeight;
            if (window.outerWidth > window.outerHeight) {
                mapWidth = (window.outerHeight * mapRatio) / 2.1;
                mapHeight = window.outerHeight / 2.1;
            } else {
                mapWidth = window.outerWidth / 2.1;
                mapHeight = window.outerWidth / (2.1 * mapRatio);
            }

            d3.select("#us-chart").style("width", mapWidth + "px");

            var idx = mapJson.map(function(d) {
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

            var svg = d3.select("#us-chart").append("svg")
            .attr("width", mapWidth)
            .attr("height", mapHeight);

            var group= svg.append("g")
            .attr("id", "states");


            var states = group.selectAll("path")
            .data(mapJson)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", function(d) {
                return quantize(d.index);
            })
            .attr("class", function(d) {
                return d.code + ' state selected';
            })
            .attr("filterCount", 0)
            .on("click", this.handleSelect)

            var titles = states.append("svg:title")
            .text(function(d) {
                return d.fullname;
            });

            this.graphObjects.states = states;
        },

        handleSelect: function(d) {
            var state = d.code;
            var currentClass = d3.select(this).attr("class");
            var filterItem = {"row": d.row, "selection":state, "type":"state", "parent":null, "parenttype":null};

            if (selected.states.length === statesW2E.length) {
                selected.states = [d.code];
                treemap.addFilter(filterItem);
                circlePacking.addFilter(filterItem);
                scatterplot.addFilter(filterItem);
                //CoLMap.addFilter(data);
                //TODO
            } else {
                if (selected.states.indexOf(d.code) > -1) {
                    selected.states.splice(selected.states.indexOf(d.code), 1);
                    treemap.removeFilter(filterItem);
                    circlePacking.removeFilter(filterItem);
                    scatterplot.removeFilter(filterItem);
                    //CoLMap.removeFilter(data);
                    if (selected.states.length === 0) {
                        selected.states = statesW2E;
                    }
                } else {
                    selected.states.push(d.code);
                    treemap.addFilter(filterItem);
                    circlePacking.addFilter(filterItem);
                    scatterplot.addFilter(filterItem);
                    //CoLMap.addFilter(data);
                }
            }

            //updateVis();
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
        },

        getStates: function(data) {
            var selectedStates = [];
            // loop through all rows
            json.forEach(function(d) {
                // if the selection matches with the type in current row
                if (d[data.type] === data.selection) {
                    // push the selected State to the array if not already present
                    if (selectedStates.indexOf(d.state) === -1) {
                        selectedStates.push(d.state);
                    }
                }
            });
            return selectedStates;
        },

        addFilter: function(data) {
            if (data.type==='salary'){
                this.graphObjects.states.filter(function(d){
                    if (containsInFilterArray(d,data.type)){
                        return d;
                    }
                }).attr("class", function(d){
                  removeFromFilterArray(d, data.type);
                  return changeClasses(d,this);
              })
            }
            var selection = this.graphObjects.states.filter(function(d){
                if (typeof d.row!='undefined' && d.row.length!=0){
                    
                    var found = false;
                    switch(data.type){
                        case "companyname":
                        for(var i=0;i<d.row.length;i++){
                            if (data.selection === d.row[i][data.type]){
                                found = true;
                            }
                        }
                        break;
                        case "jobtitle":
                        for(var i=0;i<d.row.length;i++){
                            if (data.selection === d.row[i][data.type]){
                                found = true;
                            }
                        }
                        break;
                        case "salary":
                        for(var i=0;i<d.row.length;i++){
                            if (data.selection.length==2 && data.selection[0] <= d.row[i][data.type] && data.selection[1] >= d.row[i][data.type]){
                                found = true;
                            }
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

        },

        removeFilter: function(data) {
            var selection = this.graphObjects.states.filter(function(d){
                if (typeof d.row!='undefined' && d.row.length!=0){
                    
                    var found = false;
                    switch(data.type){
                        case "companyname":
                        for(var i=0;i<d.row.length;i++){
                            if (data.selection === d.row[i][data.type]){
                                found = true;
                            }
                        }
                        break;
                        case "jobtitle":
                        for(var i=0;i<d.row.length;i++){
                            if (data.selection === d.row[i][data.type]){
                                found = true;
                            }
                        }
                        break;
                        case "salary":
                        for(var i=0;i<d.row.length;i++){
                            if (data.selection.length==2 && data.selection[0] <= d.row[i][data.type] && data.selection[1] >= d.row[i][data.type]){
                                found = true;
                            }
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

    };
