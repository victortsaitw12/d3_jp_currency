const express = require('express');
const http = require('http');
const app = express()
const path = require('path');

function fetchData(db, coin_type){
  return Promise.resolve().then(() => {
    return new Promise((resolve, reject) => {
    db.find({'coin_type': coin_type}, { projection: { _id: 0 } })
      .sort({ updated_time: -1 })
      .limit(50)
      .toArray((err, data) => {
        if(err){
          return reject(err);
        }
        resolve(data);  
      });
    });
  }).then(data => {
    return data.map((currency) => {
      currency.updated_time = currency.updated_time.setMilliseconds(0);
      currency.updated_time = new Date(currency.updated_time);
      return currency;
    });
  }).catch(err => {
    console.log(err.stack);  
    return [];
  });
}

function start(db){
  app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  app.get('/', (req, res) => {
    res.json({
      api: 'restful'  
    });
  });

  app.get('/restful/jpy_currency', (req, res) => {
    http.get(
      'http://' + process.env.AUTH_URL + '/validateJWT?token=' + req.query.token
    ,auth_res => {
      auth_res.setEncoding('utf8');
      let rawData = '';
      auth_res.on('data', (chunk) => { rawData += chunk; });
      auth_res.on('end', () => {
        return Promise.resolve().then(() =>{
          return JSON.parse(rawData);
        }).then(data => {
          if(!db) reject('db is undefined');  
          return data;
        }).then(data => {
           return fetchData(db, req.query.coin_type);
        }).then(data => {
          return res.json(data);
        }).catch(err => {
          console.log(err.stack);  
          return res.json({});
        });
      });
      auth_res.on('error', err => {
        console.log(err.stack);  
        return res.json({});
      });
    });
  });

  app.listen(8081, () => {
    console.log('Restful run on 8081');  
  });
}

module.exports = {start, fetchData};
