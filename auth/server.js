'use strict'
const express = require('express');
const passport = require('passport');
const config = require('./config');

require('./passport')(passport); // pass passport for config

var app = express();
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(passport.initialize());

app.get('/appID', (req, res) => {
  res.json({
    app_id: config.facebook.appID,
  });  
});

app.get('/', (req, res) => {
  res.json({
    api: 'auth'  
  });
});

app.get('/auth/facebook/token',
  passport.authenticate('facebook-token', {
    session: false  
  }), (req, res) => {
    res.json({
      user: req.user  
  });
});

app.get('/validateJWT', passport.authenticate('jwt', {
    session: false,
}), (req, res) => {
  return res.json({
    token: req.query.token,
    user: req.user,
    result: "validate"
  });
});

app.listen(9000);
