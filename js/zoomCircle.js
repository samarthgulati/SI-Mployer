circlePacking = {
    graphObjects:{}, 
    createGraph:function(diameter){

        format = d3.format(",d");
        d3.select("#circlepacking").style("width",diameter+"px");
        var circleColor = d3.scale.linear()
        .domain([-1, 2])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);


        var pack = d3.layout.pack()
        .size([diameter - 10, diameter - 10])
        .value(function(d) { return d.count; });

        var circleToolTip = d3.select("body")
        .append("div")
        .attr("class", "tool")       
        .style("opacity", 0);


        var svg = d3.select("#circlepacking").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate("+diameter/2+","+diameter/2+")");

        var focus = circlepackingJson,
        circleNodeData = pack.nodes(circlepackingJson),
        view;

        var group = svg.selectAll("g")
        .data(circleNodeData)
        .enter().append("g")
        .on("click", function(d) { 
            var node = this.childNodes[0];
            var companyname = d.row["companyname"];
            var companyfunding = d.row["companyfunding"];
            var currentClass = d3.select(node).attr("class");
            var filterItem = {"row": d.row, "selection":companyname, "type":"companyname", "parent":companyfunding, "parenttype":"companyfunding"};
            if (currentClass.indexOf("selected")>-1){
                currentClass = currentClass.replace("selected","");
                d3.select(node).attr("class", currentClass.trim());
                //treeFilter.push(filterItem);
                treemap.removeFilter(filterItem);
            }else{
                d3.select(node).attr("class", currentClass.trim() + " selected");
                //treeFilter.push(filterItem);
                treemap.addFilter(filterItem);
            }
            if (focus !== d && d.children!=null) {
                zoom(d); 
                d3.event.stopPropagation();
            } 
        });

var circle = group.append("circle")
.attr("class", function(d) { return d.parent ? (d.children ? "circlenode" : "circlenode circlenode--leaf") : "circlenode circlenode--root"; })
.style("fill", function(d) { return d.children ? circleColor(d.depth) : null; })
.on('mouseover', function(d,i){
   circleToolTip.transition()    
   .duration(200)    
   .style("opacity", .9);  
   circleToolTip.html(function(){
          //console.log(d.name); 
          var content = "<b>"+d.name+"</b>";
          if (typeof d.count != 'undefined'){
             content = content + "</br>People: "+d.count;
         }
         if (typeof d.parent != 'undefined' && d.parent.name != 'root'){
             content = content + "</br>Sector: "+d.parent.name;
         }
         return content;
     })  
   .style("left", (d3.event.pageX+50) + "px")   
   .style("top", (d3.event.pageY+25) + "px");

           //console.log(d3.event.pageX + ", " + d3.event.pageY);
       })
.on("mouseout", function(d) {   
   circleToolTip.transition()    
   .duration(500)    
   .style("opacity", 0); 
});

var titleNodes = group.append("title")
.text(function(d){ return d.name; })

var textNode = group.append("text")
.attr("class","label circlelabel")
.attr("fill-opacity", function(d){  return d.parent === circlepackingJson ? 1 : 0;  })
.attr("display", function(d){ return d.parent === circlepackingJson ? "inline" : "none"; })
.text(function(d) { 
   return d.name.substring(0, (d.r  > d.name.length*2.2 ? d.name.length : d.r/1.4)); 
});

var circleNode = svg.selectAll("circle,text");

d3.select("#circlepacking")
.style("background", circleColor[-1])
.on("click", function(){ zoom(circlepackingJson); });


zoomTo([circlepackingJson.x, circlepackingJson.y, circlepackingJson.r*2 + 10]);

function zoom(d) {
   var focus0 = focus; focus = d;

   var transition = d3.transition()
   .duration(d3.event.altKey ? 7500 : 750)
   .tween("zoom", function(d) {
      var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + 10]);
      return function(t) { zoomTo(i(t)); };
  });

   transition.selectAll(".circlelabel")
   .filter(function(d) { 
    return d.parent === focus || this.style.display === "inline"; 
  })
   .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
   .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
   .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v) {
   var k = diameter / v[2]; view = v;
   circleNode.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
   circle.attr("r", function(d) { return d.r * k; });
}

this.graphObjects.msg = "lol";
this.graphObjects.textNodes = textNode;
this.graphObjects.titleNodes = titleNodes;
this.graphObjects.groups = group;
this.graphObjects.circles = circle;

return;
},

addFilter:function(data){
    var selection = this.graphObjects.circles.filter(function(d){
        if (typeof d.row!='undefined'){
            if (data.row.jobtitle === d.row.jobtitle){
                d.filterCount++;
                return d;
            }
        }
    }).attr("class", function(d){
        return changeClasses(d, this);
    });
    //selection.classed("selected", true);
},
removeFilter:function(data){
    var selection = this.graphObjects.circles.filter(function(d){
        if (typeof d.row!='undefined'){
            if (data.row.jobtitle === d.row.jobtitle){
                console.log(d.row.jobtitle);
                d.filterCount--;
                return d;
            }
        }
    }).attr("class", function(d){
        return changeClasses(d, this);
    });
}

}
