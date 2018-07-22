function getJWT(){
  var url = window.location.href;
  let params = new URL(url).searchParams;
  let user = JSON.parse(params.get('user'));
  return user.user.jwt_token;
}
function showUserInfo(){
  var url = window.location.href;
  let params = new URL(url).searchParams;
  let user = JSON.parse(params.get('user'));
  let user_photo = user.user.facebook.photo;
  d3.select("#userPhoto").attr("src", user_photo);
  d3.select("#userName").text("Hi, " + user.user.facebook.name);
}
function translateDataForTable(data){
  var data2 = R.groupBy(function(currency){
    return currency.updated_time
  })(data);
  var data3 =  R.map((updated_time) => {
    let currencies = data2[updated_time];
    let currency = R.reduce((acc, value) => {
      acc[value['name']] = value['jpy'];  
      return acc;
    }, {}, currencies);
    currency.updated_time = updated_time;
    return currency;
  }, Object.keys(data2));
  return data3;
}
function drawLineGraph(data){
  var svg = d3.select("#lineChart"),
  margin = {top: 20, right: 80, bottom: 30, left: 40},
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
  //bank.append("text")
  //    .datum(function(d) { return {
  //      name: d.name, 
  //      value: d.values[d.values.length - 1]
  //    }; })
  //    .attr("transform", function(d) { 
  //      return "translate(" + x(d.value.date) + "," + y(d.value.currency) + ")";
  //    })
  //    .attr("x", 20)
  //    .attr("dy", "0.35em")
  //    .attr("text-anchor", "start")
  //    .style("font", "10px sans-serif")
  //    .text(function(d) { 
  //      return d.name ;
  //    });
};

function drawTable(data){
  var rows_data = translateDataForTable(data);
  let uniq_keys = [];
  R.forEach((obj) => {
    uniq_keys = R.compose(
      R.uniqBy(String), 
      R.concat(uniq_keys), 
      R.keys)(obj);
  }, rows_data);
  uniq_keys = R.compose(
    R.prepend('updated_time'),
    R.reject(R.equals("updated_time"))
  )(uniq_keys);
  console.log(uniq_keys);
  let table = d3.select('#currencyList');
  table.append('thead')
       .append('tr')
       .selectAll('th')
       .data(uniq_keys)
       .enter().append('th')
       .text(function(d){
         if(d == "updated_time") return "#";
         return d;
       });
   
   let rows = table.append('tbody')
                   .selectAll('tr')
                   .data(rows_data)
                   .enter()
                   .append('tr');
   let cells = rows.selectAll('td')
                   .data((row) => {
                     return uniq_keys.map(column => {
                       return { column: column, value: row[column] };  
                     });
                   }).enter()
                   .append('td')
                   .text(d => {
                     if(d.column == "updated_time"){
                       let updated_time = new Date(d.value);
                       let hours = updated_time.getHours();
                       let amOpm = hours >= 12 ? 'pm' : 'am';
                       hours = hours % 12;
                       hours = hours ? hours : 12;
                       let min = updated_time.getMinutes();
                       min = min < 10 ? '0' + min : min;
                       return updated_time.getFullYear() + "-" +
                              (updated_time.getMonth() + 1) + "-" +
                              updated_time.getDate() + " " +
                              hours + ":" + min + " " + amOpm;
                     }
                     return d.value ? d.value : '-';
                   });
}
function getCurrencyData(){
  d3.json(
    "http://localhost:8081/jpy_currency?token=" + getJWT()
  ).then(data => {
    drawLineGraph(data);
    return data;  
  }).then(data => {
    drawTable(data);
    return data;
  });
};

showUserInfo();
getCurrencyData();

