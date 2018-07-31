const page_count = 10;
const max_page = 4;
let current_page = 0;
let drawTableByPage = null;
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
  let user_photo = '';
  let user_name =  '';
  if(user.user.facebook){
    user_photo = user.user.facebook.photo;
    user_name = user.user.facebook.name;
  }
  if(user.user.google){
    user_photo = user.user.google.photo;
    user_name = user.user.google.name;
  }
  d3.select("#userPhoto").attr("src", user_photo);
  d3.select("#userName").text("Hi, " + user_name);
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
function drawScatterPlot(data){
  let strictISOParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  let svg = d3.select("#scatterPlot"),
  margin = {top: 20, right: 80, bottom: 30, left: 40},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom;
 
  let x = d3.scaleTime().range([0, width]);  // x scale
  let y = d3.scaleLinear().range([height, 0]); // y scale
  let color = d3.scaleOrdinal(d3.schemeCategory10); // color scale (10 colors)
  // scale domains
  x.domain(d3.extent(data, d => {
    return strictISOParse(d.updated_time);
  })).nice();
  y.domain(d3.extent(data, d => d.jpy)).nice();

  let g = svg.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Create x axis and move to the bottom
  g.append("g")
   .attr("class", "axis axis--x")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x))
   .append("text")
   .attr("class", "label")
   .attr("x", width)
   .attr("y", -6)
   .style("text-anchor", "end")
   .text("Date");
   
  // Create y axis and move to the left
  g.append("g")
   .attr("class", "axis axis--y")
   .call(d3.axisLeft(y))
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 6)
   .attr("dy", "0.71em")
   .attr("fill", "#000")
   .style("text-anchor", "end")
   .text("Currency");

  g.selectAll(".dot")
   .data(data)
   .enter()
   .append("circle")
   .attr("class", "dot")
   .attr("r", 3.5)
   .attr("cx", function(d) { return x(strictISOParse(d.updated_time)); })
   .attr("cy", function(d) { return y(d.jpy); })
   .style("fill", function(d) { return color(d.name); });
}
function tagColor(data){
  let banks = data.reduce(function(res, obj){
    if (!(obj.name in res)){
      res.push(obj.name);
    }
    return res;
  }, []);
  banks = R.uniq(banks);
  let svg = d3.select("#color"),
  margin = {top: 10, right: 80, bottom: 30, left: 20},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom;
        
  let color = d3.scaleOrdinal(d3.schemeCategory10); // color scale (10 colors)

  let g = svg.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var legend = g.selectAll(".legend")
        .data(banks)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
  legend.append("rect")
      //.attr("x", width - 18)
      .attr("x", 0)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", d => { return color(d); });
  legend.append("text")
      //.attr("x", width - 24)
      .attr("x", 22)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return d; });
}
function drawLineGraph(data){
  let svg = d3.select("#lineChart"),
  margin = {top: 20, right: 80, bottom: 30, left: 40},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom;
        
  // Append Group tag to the SVG
  let g = svg.append("g")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let strictISOParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

  let x = d3.scaleTime().range([0, width]);  // x scale
  let y = d3.scaleLinear().range([height, 0]); // y scale
  let z = d3.scaleOrdinal(d3.schemeCategory10); // color scale (10 colors)

  // use line generator to generate path data.
  let line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { 
      return x(d.date);
    })
    .y(function(d) { 
      return y(d.currency);
    });

  let bank_objs = data.reduce(function(res, obj){
    if (!(obj.name in res)){
      res[obj.name] = [];
    }
    res[obj.name].push({
      date: strictISOParse (obj.updated_time),
      currency: obj.jpy
    });
    return res;
  }, {});
  let banks = Object.keys(bank_objs).map(function(key){
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
  let bank = g.selectAll(".bank")
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
function drawTableHead(data){
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
  let head = d3.select('#head_id');
  head.exit().remove();
  let head_col = head.selectAll('th')
  let update_head = head_col.data(uniq_keys, d => {
         return { text: d, date: new Date() };
       });
  update_head.exit().remove();
  let enter_head = update_head.enter()
                              .append('th')
  enter_head.text(function(d){
    if(d == "updated_time") return "#";
    return d;
  });
  return uniq_keys;
}
function drawTable(data, uniq_keys, page){
  var rows_data = translateDataForTable(data);
  const begin = page * page_count;
  const end = begin + page_count;
  rows_data = rows_data.slice(begin, end);
  let table = d3.select('#currencyList');
  let table_body = table.select('#tbody_id')
  table_body.exit().remove();
  let rows = table_body.selectAll('tr');
  let updated_rows = rows.data(rows_data, d => {
    return d.updated_time;
  });
  updated_rows.exit().remove();
  let enter_rows = updated_rows.enter().append('tr');
  let cells = enter_rows.selectAll('td')
                  .data((row) => {
                     let update_col_data = uniq_keys.map(column => {
                       return { column: column, value: row[column], date: new Date()};  
                     });
                     return update_col_data;
                  });
   cells.exit().remove();
   cells.enter()
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
  enter_rows.exit().remove();
}
function drawPageButton(data){
  let li = d3.select('#page')
             .selectAll('li')
             .data(['prev', '1', '2', '3', 'next'])
             .enter()
             .append('li')
             .classed('page-item', true)
             .attr('id', d => {
               if(d == 'prev') return 'page_' + 0;
               if(d == 'next') return 'page_' + 4;
               return 'page_' + d;
             });

  li.append('a')
    .datum(d => d)
    .classed('page-link', true)
    .text(d => d)
    .on('click', d => {
      if (d == 'prev'){
        current_page = current_page > 0 ? current_page - 1 : current_page;
      } else if(d == 'next'){
        current_page = current_page < max_page ? current_page + 1 : current_page;
      } else {
        current_page = parseInt(d);
      }
      drawTableByPage(current_page);
      d3.select('#page').selectAll('li').classed('active', false);
      // const id = d3.event.target.id;
      d3.select('#page_' + current_page).classed('active', true);
      // d3.select(d3.event.target.parentNode).classed('active', true);
    });
}
function getCurrencyData(){
  d3.json(
    // "http://localhost:8081/jpy_currency?token=" + getJWT()
    "/restful/jpy_currency?token=" + getJWT()
  ).then(data => {
    drawLineGraph(data);
    return data;  
  }).then(data => {
    drawScatterPlot(data);
    return data;
  }).then(data =>{
    tagColor(data);
    return data;
  }).then(data => {
    const uniq_keys = drawTableHead(data)
    drawTableByPage = R.partial(drawTable, [data, uniq_keys]);
    drawTableByPage(0);
    return data;
  }).then(data => {
    drawPageButton();
    return data;
  });
};

showUserInfo();
getCurrencyData();

