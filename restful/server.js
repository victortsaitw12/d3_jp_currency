const express = require('express');
const http = require('http');
const app = express()
const path = require('path');

function ElkfetchData(elasticsearch, coin_type) {
  return Promise.resolve().then(() => {
    return elasticsearch.search({
      index: 'article',
      type: 'article',
      body: {
        query: {
          match: {
            title: coin_type
          }
        }
      }
    });
  }).then(function (resp) {
    console.log(resp);
    var hits = resp.hits.hits;
    return hits;
  }).catch(err => {
    console.log(err.stack);
    return [];  
  });
}

function MongofetchData(mongo, coin_type){
  return Promise.resolve().then(() => {
    return new Promise((resolve, reject) => {
    mongo.find({'coin_type': coin_type}, { projection: { _id: 0 } })
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

function start(mongo, elasticsearch){
  app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  app.get('/restful/news', (req, res) => {
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
          if(!elasticsearch) reject('elasticsearch is undefined');  
          return data;
        }).then(data => {
           return ElkfetchData(elasticsearch, req.query.coin_type);
        }).then(data => {
          console.log(data);
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
          if(!mongo) reject('mongo is undefined');  
          return data;
        }).then(data => {
           return MongofetchData(mongo, req.query.coin_type);
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

module.exports = {start, MongofetchData};
