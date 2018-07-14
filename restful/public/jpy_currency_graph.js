var svg = d3.select("svg"),
margin = {top: 20, right: 80, bottom: 30, left: 50},
width = svg.attr("width") - margin.left - margin.right,
height = svg.attr("height") - margin.top - margin.bottom;
        
// Append Group tag to the SVG
var g = svg.append("g")
           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var strictISOParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

var x = d3.scaleTime().range([0, width]);  // x scale
var y = d3.scaleLinear().range([height, 0]); // y scale
var z = d3.scaleOrdinal(d3.schemeCategory10); // color scale (10 colors)

// use line generator to generate path data.
var line = d3.line()
             .curve(d3.curveBasis)
             .x(function(d) { 
                 return x(d.date);
             })
             .y(function(d) { 
                 return y(d.currency);
             });

d3.json("http://localhost:8080/jpy_currency").then(data => {
    // Organize the raw data
    var bank_objs = data.reduce(function(res, obj){
        if (!(obj.name in res)){
            res[obj.name] = [];
        }
        res[obj.name].push({
            date: strictISOParse (obj.updated_time),
            currency: obj.jpy
        });
            return res;
     }, {});
     var banks = Object.keys(bank_objs).map(function(key){
         return {
             name: key,
                values: bank_objs[key]
         }  
     });
     // scale domains
     x.domain([
         d3.min(banks, function(c) { 
             return d3.min(c.values, function(d){ return d.date; });
         }),
         d3.max(banks, function(c) { 
             return d3.max(c.values, function(d){ return d.date; });
         })
     ]);
     y.domain([
         d3.min(banks, function(c) { 
             return d3.min(c.values, function(d){ return d.currency; });
         }),
         d3.max(banks, function(c) { 
             return d3.max(c.values, function(d){ return d.currency; });
         })
     ]);
     z.domain(banks.map(function(c){
         return c.name;  
     }));

     // Create x axis and move to the bottom
     g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

     // Create y axis and move to the left
     g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Currency");

     // Bind the data
     var bank = g.selectAll(".bank")
                 .data(banks)
                 .enter().append("g")
                 .attr("class", "bank");

     // Render the curve line
     bank.append("path")
         .attr("class", "line")
         .attr("d", function(d) { 
             return line(d.values); 
         })
         .style("stroke", function(d) { 
             return z(d.name); // make a color from color scale
         }).on("mouseover", function(d){
             var tip = d3.select("#tooltip");
             tip.style("left", (+d3.event.clientX + 10) + 'px');
             tip.style("top", (+d3.event.clientY + 10) + 'px'); 
             tip.select("#bank_name").text(d.name);
             d3.select("#tooltip").classed("hidden", false);
         }).on("mouseout", function(d){
             d3.select("#tooltip").classed("hidden", true);  
         });

     // Add the text at the end of lines
     bank.append("text")
         .datum(function(d) { return {
             name: d.name, 
             value: d.values[d.values.length - 1]
         }; })
         .attr("transform", function(d) { 
             return "translate(" + x(d.value.date) + "," + y(d.value.currency) + ")";
         })
         .attr("x", 20)
         .attr("dy", "0.35em")
         .style("font", "10px sans-serif")
         .text(function(d) { 
             return d.name ;
         });
});
