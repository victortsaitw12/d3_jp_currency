'use strict'

const config = require('./config');
const FacebookTokenStrategy = require('passport-facebook-token');
const JwtStrategy = require('passport-jwt').Strategy;
const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongo = require('./mongo');

function makeJWT(user_id){
  return jwt.sign({
    user_id: user_id
  }, config.jwt.key, {
    expiresIn: 60  
  });
}

function createUser(token, profile){
  let user = { 
    facebook: {
      token: token,
      name: profile.name.givenName + ' '+
        profile.name.familyName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value
    },
    updated_dt: Date.now(),
    coin: 100
  };
  return Promise.resolve().then(() => {
    return mongo.createUser(user);
  }).then(() => {
    return user;
  });
}

function findUserById(id){
  return mongo.findUserById(id)
    .then(user =>{
      return Object.assign(user, {
        jwt_token: makeJWT(user._id)
      })
    });
}

module.exports = function(passport){

  // Strategy to validate facebook token
  passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: config.facebook.appID,
    clientSecret: config.facebook.appSecret 
  }, (token, refreshToken, profile, done) => {
    //return mongo.findUserByFBToken(token).then(user => {
    return mongo.findUserByEmail(
      profile.emails[0].value
    ).then(user => {
      if(!user){
        return createUser(token, profile);
      }
      return user;
    }).then(user => {
      Object.assign(user, {
        jwt_token: makeJWT(user._id)
      })
      console.log(user);
      return done(null, user);
    }).catch(err =>{
      console.log(err);
      return done(err);
    });
  }));
  
  //Strategy to validate JWT token
  passport.use('jwt', new JwtStrategy({
    // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
    secretOrKey: config.jwt.key,
  }, (payload, done) => {
    if (payload){
      return done(null, payload);
    }
    return done(null, false);
  }));

}
