'use strict'
const express = require('express');
const passport = require('passport');
const verifyGoogleToken = require('./passport').verifyGoogleToken;
const verifyLocalLogin = require('./passport').verifyLocalLogin;
const config = require('./config');
const bodyParser = require('body-parser');

require('./passport').routing(passport); // pass passport for config

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(passport.initialize());

app.get('/auth/appID', (req, res) => {
  res.json({
    app_id: config.facebook.appID,
  });  
});

app.get('/auth/googleAppID', (req, res) => {
  res.json({
    app_id: config.google.clientID,
  });  
});

app.get('/', (req, res) => {
  res.json({
    api: 'auth'  
  });
});

app.post('/auth/local', 
  passport.authenticate('local', {
    session: false  
  }), (req, res) => {
    res.json({
      user: req.user  
  });
});

app.post('/auth/localaaaa', (req, res) => {
  console.log(req);
  verifyLocalLogin(
    req.query.email,
    req.query.password
  ).then(user => res.json({
    user: user
  })).catch(err => {
    console.log(err.message);
    res.status(501);
  });
});

app.get('/auth/google/token', (req, res) => {
  verifyGoogleToken(req.query.access_token).then(user => res.json({
    user: user
  })).catch(err => {
    throw err;
  });
});

app.get('/auth/google/token',
  passport.authenticate('google-token'), 
  (req, res) => {
    console.log(req);
    res.json({
      user: req.user  
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
