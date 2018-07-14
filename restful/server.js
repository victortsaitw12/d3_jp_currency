const express = require('express');
const app = express()
const mongo = require('./mongo');
var path = require('path');
let db = undefined;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/jpy_currency', (req, res) => {
  if(!db){ 
    return res.send('db is undefined');
  }
  db.find({}, {projection: {_id: 0}}).sort({updated_time:1}).toArray((err, data) => {
    console.log(data);
    return res.json(data);  
  });
});

mongo.init().then(function(db_collection){
  db = db_collection;
}).then(function(){
  app.listen(8080, () => {
    console.log('Restful run on 8080');  
  });
}).catch(function(error){
  console.log(error.message);  
});
