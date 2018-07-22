const R = require('ramda');
var data = [{updated_dt: '120170801', name: 'china', jpy: 30},
            {updated_dt: '120170801', name: 'first', jpy: 29},
            {updated_dt: '120170801', name: 'taiwan', jpy: 28},
            {updated_dt: '120170802', name: 'china', jpy: 30},
            {updated_dt: '120170802', name: 'first', jpy: 29},
            {updated_dt: '120170802', name: 'taiwan', jpy: 28}];
var data2 = R.groupBy(function(currency){
  return currency.updated_dt  
})(data);
var data3 =  R.map((updated_dt) => {
  let currencies = data2[updated_dt];
  let currency = R.reduce((acc, value) => {
    acc[value['name']] = value['jpy'];  
    return acc;
  }, {}, currencies);
  currency.updated_dt = updated_dt;
  return currency;
}, Object.keys(data2));

console.log(data3);
