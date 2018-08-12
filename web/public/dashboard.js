const page_count = 10;
const max_page = 4;
const strictISOParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
let current_page = 0;
let drawTableByPage = null;
let color = d3.scaleOrdinal(d3.schemeCategory10); // color scale (10 colors)
let x_scatter_scale = null;
let y_scatter_scale = null;
let x_line_scale = null;
let y_line_scale = null;
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
  let coin_type = '';
  var data3 =  R.map((updated_time) => {
    let currencies = data2[updated_time];
    let currency = R.reduce((acc, value) => {
      acc[value['name']] = value['currency'];  
      coin_type = value['coin_type'];
      return acc;
    }, {}, currencies);
    currency.updated_time = updated_time;
    currency.coin_type = coin_type;
    return currency;
  }, Object.keys(data2));
  return data3;
}
function refreshScatterPlot(data){
  let svg = d3.select(".scatter_plot");
  x_scatter_scale.domain(d3.extent(data, d => {
    return strictISOParse(d.updated_time);
  })).nice();
  y_scatter_scale.domain(d3.extent(data, d => d.currency)).nice();

  let update_dot = svg.selectAll("circle").data(data, d => {
    let key = JSON.stringify(d);
    return key;
  });
  update_dot.exit().remove();
  update_dot.enter()
     .append("circle")
     .transition()
     .attr("class", "dot")
     .attr("r", 3.5)
     .attr("cx", function(d) { 
       return x_scatter_scale(strictISOParse(d.updated_time));
     })
     .attr("cy", function(d) {
       return y_scatter_scale(d.currency);
     })
     .style("fill", function(d) { return color(d.name); })
  d3.selectAll('circle')
    .on('mouseover', tipMouseover)
    .on('mouseout', tipMouseout);
  function tipMouseover(d) {
    d3.select('#scatterTooltip').style('display', null).
           attr("transform", "translate(" + 
             d3.mouse(this)[0] + "," + d3.mouse(this)[1] +
           ")");
    d3.select('#scatterTooltip').text(d.currency);
  }
  function tipMouseout() {
     d3.select('#scatterTooltip').style('display', 'none');
  }
  svg.select(".x.axis")
     .call(d3.axisBottom(x_scatter_scale));
  svg.select(".y.axis")
     .call(d3.axisLeft(y_scatter_scale));
  svg.exit().remove();
}
function drawScatterPlot(data){
  let svg = d3.select("#scatterPlot"),
  margin = {top: 20, right: 80, bottom: 30, left: 40},
  scatter_width = svg.attr("width") - margin.left - margin.right,
  scatter_height = svg.attr("height") - margin.top - margin.bottom;
  x_scatter_scale = d3.scaleTime().range([0, scatter_width]);  // x scale
  y_scatter_scale = d3.scaleLinear().range([scatter_height, 0]); // y scale
  // scale domains
  x_scatter_scale.domain(d3.extent(data, d => {
    return strictISOParse(d.updated_time);
  })).nice();
  y_scatter_scale.domain(d3.extent(data, d => d.currency)).nice();

  let g = svg.append("g")
             .attr('class', 'scatter_plot')
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  // Create x axis and move to the bottom
  g.append("g")
   .attr("class", "x axis")
   .attr("transform", "translate(0," + scatter_height + ")")
   .call(d3.axisBottom(x_scatter_scale))
   .append("text")
   .attr("class", "label")
   .attr("x", scatter_width)
   .attr("y", -6)
   .style("text-anchor", "end")
   .text("Date");
   
  // Create y axis and move to the left
  g.append("g")
   .attr("class", "y axis")
   .call(d3.axisLeft(y_scatter_scale))
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 6)
   .attr("dy", "0.71em")
   .attr("fill", "#000")
   .style("text-anchor", "end")
   .text("Currency");

  let update_dot = g.selectAll("circle").data(data, d => JSON.stringify(d));
  update_dot.exit().remove();
  update_dot.enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) {
              return x_scatter_scale(strictISOParse(d.updated_time));
            })
            .attr("cy", function(d) {
              return y_scatter_scale(d.currency)
            })
            .style("fill", function(d) { return color(d.name); })
            .on('mouseover', tipMouseover)
            .on('mouseout', tipMouseout);
  let tooltip = g.append("text")
                 .attr('id', 'scatterTooltip')
                 .attr('class', 'focus text')
                 .attr("x", 9).attr("dy", ".35em");     
  function tipMouseover(d) {
    tooltip.style('display', null).
           attr("transform", "translate(" + 
             d3.mouse(this)[0] + "," + d3.mouse(this)[1] +
           ")");
    tooltip.text(d.currency);
  }
  function tipMouseout() {
     tooltip.style('display', 'none');
  }
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
function refreshLineGraph(data){
  let bank_objs = data.reduce(function(res, obj){
    if (!(obj.name in res)){
      res[obj.name] = [];
    }
    res[obj.name].push({
      date: strictISOParse (obj.updated_time),
      currency: obj.currency
    });
    return res;
  }, {});
  let banks = Object.keys(bank_objs).map(function(key){
    return {
      name: key,
      values: bank_objs[key]
    }  
  });
  x_line_scale.domain([
    d3.min(banks, function(c) { 
      return d3.min(c.values, function(d){ return d.date; });
    }),
    d3.max(banks, function(c) { 
      return d3.max(c.values, function(d){ return d.date; });
    })
  ]);
  y_line_scale.domain([
    d3.min(banks, function(c) { 
      return d3.min(c.values, function(d){ return d.currency; });
    }),
    d3.max(banks, function(c) { 
      return d3.max(c.values, function(d){ return d.currency; });
    })
  ]);
  let line = d3.line()
    .x(function(d) { 
      return x_line_scale(d.date);
    })
    .y(function(d) { 
      return y_line_scale(d.currency);
    });
  let svg = d3.select(".line_chart");
  svg.select('.x.axis')
     .attr("class", "x axis")
     .call(d3.axisBottom(x_line_scale));
  svg.select('.y.axis')
     .attr("class", "y axis")
     .call(d3.axisLeft(y_line_scale))
  svg.transition();
  let bank = svg.selectAll(".bank");
  let update_bank = bank.data(banks, d => JSON.stringify(d));
  update_bank.exit().remove()
  let enter_bank = update_bank.enter().append("g")
      .attr("class", "bank");
  // Render the line
  enter_bank.append("path")
      .attr("class", "line")
      .attr("d", function(d) { 
        return line(d.values); 
      })
      .style("stroke", function(d) { 
        return color(d.name); // make a color from color scale
      }).on("mouseover", () => {
        focus.style("display", null);  
      }).on("mouseout", () => {
        focus.transition().delay(700).style("display", "none");  
      }).on("mousemove", mousemove);

  let focus = d3.select('.bank')
                .append("g").attr("class", "focus").style("display", "none");
  let bank_dots = {};
  banks.map( bank => {
    bank_dots[bank.name] = {};
    bank_dots[bank.name].tooltip = focus.append("g");
    bank_dots[bank.name].tooltip.append("circle").attr("r", 2);
    bank_dots[bank.name].tooltip.append("rect").attr("x", 8).attr("y", "-5")
         .attr("width", 35)
         .attr("height", '0.75em');
    bank_dots[bank.name].tooltip.append("text").attr("x", 9).attr("dy", ".35em");     
  });
  const margin = {top: 20, right: 80, bottom: 30, left: 40};
  const height = d3.select('#lineChart').attr("height") - margin.top - margin.bottom;
  focus.append("line").attr("class", "focus line").attr("y1", margin.bottom)
        .attr("y2", height);
  function mousemove(events) {
    const mouse_x = x_line_scale.invert(d3.mouse(this)[0])
    const i = d3.bisector((d, x) => {
      return new Date(x) - new Date(d.date);
    }).left(events.values, mouse_x, 1);
    let x_position = 0;
    let y_min_position = d3.select("#lineChart").attr('height') + margin.top;
    banks.map(bank => {   
       const d0 = bank.values[i-1];
       const d1 = bank.values[i];
       const x0 = new Date(mouse_x);
       const d = x0 > new Date(d0.date) > new Date(d1.date) - x0 ? d1 : d0;
       const y_position = y_line_scale(d.currency);
       x_position = x_line_scale(d.date);
       bank_dots[bank.name].tooltip.attr("transform", "translate(" + 
         x_position + "," + y_position +
         ")");
       bank_dots[bank.name].tooltip.select('text').text(d.currency);
       y_min_position = Math.min(y_min_position, y_position);
    });
    focus.select(".focus.line").attr("transform", "translate(" + 
      x_position + ")").attr("y1", y_min_position);
  }
}
function drawLineGraph(data){
  let svg = d3.select("#lineChart"),
  margin = {top: 20, right: 80, bottom: 30, left: 40},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom;
        
  // Append Group tag to the SVG
  let g = svg.append("g")
             .attr("class", "line_chart")
             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  x_line_scale = d3.scaleTime().range([0, width]);  // x scale
  y_line_scale = d3.scaleLinear().range([height, 0]); // y scale

  // use line generator to generate path data.
  let line = d3.line()
    .x(function(d) { 
      return x_line_scale(d.date);
    })
    .y(function(d) { 
      return y_line_scale(d.currency);
    });

  let bank_objs = data.reduce(function(res, obj){
    if (!(obj.name in res)){
      res[obj.name] = [];
    }
    res[obj.name].push({
      date: strictISOParse (obj.updated_time),
      currency: obj.currency
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
  x_line_scale.domain([
    d3.min(banks, function(c) { 
      return d3.min(c.values, function(d){ return d.date; });
    }),
    d3.max(banks, function(c) { 
      return d3.max(c.values, function(d){ return d.date; });
    })
  ]);
  y_line_scale.domain([
    d3.min(banks, function(c) { 
      return d3.min(c.values, function(d){ return d.currency; });
    }),
    d3.max(banks, function(c) { 
      return d3.max(c.values, function(d){ return d.currency; });
    })
  ]);
  // Create x axis and move to the bottom
  g.append("g")
   .attr("class", "x axis")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x_line_scale));

  // Create y axis and move to the left
  g.append("g")
   .attr("class", "y axis")
   .call(d3.axisLeft(y_line_scale))
   .append("text")
   .attr("transform", "rotate(-90)")
   .attr("y", 6)
   .attr("dy", "0.71em")
   .attr("fill", "#000")
   .text("Currency");

  // Bind the data
  let bank = g.selectAll(".bank");
  let update_bank = bank.data(banks, d => JSON.stringify(d));
  update_bank.exit().remove();
  let enter_bank = update_bank.enter().append("g")
      .attr("class", "bank");
  // Render the line
  enter_bank.append("path")
      .attr("class", "line")
      .attr("d", function(d) { 
        return line(d.values); 
      })
      .style("stroke", function(d) { 
        return color(d.name); // make a color from color scale
      }).on("mouseover", () => {
        focus.style("display", null);  
      }).on("mouseout", () => {
        focus.transition().delay(700).style("display", "none");  
      }).on("mousemove", mousemove);

  let focus = d3.select('.bank')
                .append("g").attr("class", "focus").style("display", "none");
  let bank_dots = {};
  banks.map( bank => {
    bank_dots[bank.name] = {};
    bank_dots[bank.name].tooltip = focus.append("g");
    bank_dots[bank.name].tooltip.append("circle").attr("r", 2);
    bank_dots[bank.name].tooltip.append("rect").attr("x", 8).attr("y", "-5")
         .attr("width", 35)
         .attr("height", '0.75em');
    bank_dots[bank.name].tooltip.append("text").attr("x", 9).attr("dy", ".35em");     
  });
  focus.append("line").attr("class", "focus line").attr("y1", margin.bottom)
        .attr("y2", height);
  console.log(height);
  function mousemove(events) {
    const mouse_x = x_line_scale.invert(d3.mouse(this)[0])
    const i = d3.bisector((d, x) => {
      return new Date(x) - new Date(d.date);
    }).left(events.values, mouse_x, 1);
    let x_position = 0;
    let y_min_position = height + margin.top;
    banks.map(bank => {   
       const d0 = bank.values[i-1];
       const d1 = bank.values[i];
       const x0 = new Date(mouse_x);
       const d = x0 > new Date(d0.date) > new Date(d1.date) - x0 ? d1 : d0;
       const y_position = y_line_scale(d.currency);
       x_position = x_line_scale(d.date);
       bank_dots[bank.name].tooltip.attr("transform", "translate(" + 
         x_position + "," + y_position +
         ")");
       bank_dots[bank.name].tooltip.select('text').text(d.currency);
       y_min_position = Math.min(y_min_position, y_position);
    });
    focus.select(".focus.line").attr("transform", "translate(" + 
      x_position + ")").attr("y1", y_min_position);
  }
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
    R.reject(R.equals("coin_type")),
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
function drawNewsTable(coin_type, data, uniq_keys, page){
  let table = d3.select('#newsList');
  let table_body = table.select('#news_tbody_id');
  let rows = table_body.selectAll('tr');
  let updated_rows = rows.data(data, d => JSON.stringify(d));
  updated_rows.exit().remove();
  let enter_rows = updated_rows.enter().append('tr')
       .attr('data-toggle', d => "modal")
       .attr('data-target', d => "#exampleModalCenter")
       .on('click', d => {
          d3.select('#modelNewsTitle').text(d._source.title);
	  console.log(d._source.content);
          d3.select('#modelNewsBody').html(d._source.content.replace(/\n/g, "<br />"));
       });
  let cells = enter_rows.selectAll('td')
                .data(row => {
                  return ['time', 'title'].map(column => {
                      return {
                        column: column,
                        value: row._source[column],
                        date: new Date(),
                      };
                  });
                });
  cells.exit().remove();
  cells.enter()
       .append('td')
       .text(d => {
          if(d.column == "time"){
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
  cells.exit().remove();
  enter_rows.exit().remove();
}
function drawTable(coin_type, data, uniq_keys, page){
  var rows_data = translateDataForTable(data);
  const begin = page * page_count;
  const end = begin + page_count;
  rows_data = rows_data.slice(begin, end);
  let table = d3.select('#currencyList');
  let table_body = table.select('#tbody_id')
  table_body.exit().remove();
  let rows = table_body.selectAll('tr');
  let updated_rows = rows.data(rows_data, d => {
    return d.coin_type + '.' + d.updated_time;
  });
  updated_rows.exit().remove();
  let enter_rows = updated_rows.enter().append('tr');
  let cells = enter_rows.selectAll('td')
                  .data((row) => {
                     let update_col_data = uniq_keys.map(column => {
                       return { 
                         column: column, 
                         value: row[column], 
                         date: new Date(),
                       };  
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
  cells.exit().remove();
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
function getCurrencyData(coin_type){
  d3.json(
    "/restful/jpy_currency?coin_type="+ coin_type + "&" + "token=" + getJWT()
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
    drawTableByPage = R.partial(drawTable, [coin_type, data, uniq_keys]);
    drawTableByPage(0);
    return data;
  }).then(data => {
    drawPageButton();
    return data;
  });
};
function refreshCurrencyData(coin_type){
  d3.json(
    "/restful/jpy_currency?coin_type="+ coin_type + "&" + "token=" + getJWT()
  ).then(data => {
    const uniq_keys = drawTableHead(data);
    drawTableByPage = R.partial(drawTable, [coin_type, data, uniq_keys]);
    drawTableByPage(0);
    return data;
  }).then(data => {
    drawPageButton();
    return data;
  }).then(data => {
    refreshScatterPlot(data);
    return data;  
  }).then(data => {
    refreshLineGraph(data);
    return data;  
  });
}
function refreshCurrencyNews(target){
  const coin_type = d3.select(target).attr('data');
  d3.json(
    "/restful/news?coin_type="+ coin_type + "&" + "token=" + getJWT()
  ).then(data => {
    drawNewsTable(coin_type, data);
    return data;  
  }).catch(err => {
    console.log(err.message);  
  });
}
function regestEvent(){
  d3.selectAll(".nav-link").on("click", d => {
    refreshCurrencyData(d3.event.target.id);
    refreshCurrencyNews(d3.event.target);
  });
}
showUserInfo();
getCurrencyData('usd');
regestEvent();
