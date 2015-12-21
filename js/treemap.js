treemap = {
  graphObjects:{},

  position: function() {
    this.style("left", function(d) { return d.x + "px"; })
    .style("top", function(d) { return d.y + "px"; })
    .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
    .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  },

  createGraph:function(){

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
        tooldiv.html(function(){
          var content = "<b>"+d.name+"</b>";
          if (typeof d.count != 'undefined'){
           content = content + "</br>People: "+d.count;
         }
         if (typeof d.parent != 'undefined' && d.parent.name != 'root'){
           content = content + "</br>Category: "+d.parent.name;
         }
         return content;
       })  
        .style("left", (d3.event.pageX+50) + "px")   
        .style("top", (d3.event.pageY+25) + "px");

        //console.log(d3.event.pageX + ", " + d3.event.pageY);
      })
       .on("mouseout", function(d) {   
        tooldiv.transition()    
        .duration(500)    
        .style("opacity", 0); 
      })
       .on('click', function(d){
        var node = this;
        var jobcategory = d.parent.name;
        var jobtitle = d.name;
        var currentClass = d3.select(node).attr("class");
        var filterItem = {"row": d.row, "selection":jobtitle, "type":"jobtitle", "parent":jobcategory, "parenttype":"jobcategory"};
        if (currentClass.indexOf("selected")>-1){
          currentClass = currentClass.replace("selected","");
          d3.select(node).attr("class", currentClass.trim());
          //treeFilter.push(filterItem);
          circlePacking.removeFilter(filterItem);
        }else{
          d3.select(node).attr("class", currentClass.trim() + " selected");
          //treeFilter.push(filterItem);
          circlePacking.addFilter(filterItem);
        }
      })
       .call(this.position)
       .style("background", function(d) { return d.children ? color(d.name) : null; })
       .text(function(d) { return d.children ? null : d.name; });

       this.graphObjects.rectangles = node;

       return;
     },

     addFilter:function(data){
      var selection = this.graphObjects.rectangles.filter(function(d){
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
          }

          if (found){
            d.filterCount++;
            return d;
          }
        }
      }).attr("class", function(d){
        return changeClasses(d, this);
      });
    },

    removeFilter:function(data){
      var selection = this.graphObjects.rectangles.filter(function(d){
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
          }

          if (found){
            d.filterCount--;
            return d;
          }
        }
      }).attr("class", function(d){
        return changeClasses(d, this);
      });
    }
  };



