'use strict'
const mongo = require('./mongo');
const server = require('./server');

console.log('load index');
mongo.init().then(function(db_collection){
  return db_collection;
}).then(function(mongo){
  server.start(mongo);
  server.fetchData(mongo);
}).catch(function(error){
  console.log(error.message);  
});
