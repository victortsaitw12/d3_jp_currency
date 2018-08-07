'use strict'
const mongo = require('./mongo');
const elk = require('./elk');
const server = require('./server');

console.log('load index');
mongo.init().then(function(db_collection){
  return db_collection;
}).then(function(mongo){
  return elk.init().then(elasticsearch => {
    return {mongo, elasticsearch}
  });
}).then(({mongo, elasticsearch}) => {
  server.start(mongo, elasticsearch);
}).catch(function(error){
  console.log(error.message);  
});
