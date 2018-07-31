'use strict'

const config = require('./config');
const FacebookTokenStrategy = require('passport-facebook-token');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const mongo = require('./mongo');
const {OAuth2Client} = require('google-auth-library');
const GoogleClient = new OAuth2Client(config.google.clientID);
function makeJWT(user_id){
  return jwt.sign({
    user_id: user_id
  }, config.jwt.key, {
    expiresIn: 3600  
  });
}

function upsertGoogleUser(user, token, profile){
  user['google'] = {
    token: token,
    name: profile.given_name + ' '+
        profile.family_name,
    email: profile.email,
    photo: profile.picture
  };
  return Promise.resolve().then(() => {
    return mongo.upsertUser(user);
  }).then(() => {
    return user;
  });
}

function upsertFacebookUser(user, token, profile){
  user['facebook'] = {
    token: token,
    name: profile.name.givenName + ' '+
      profile.name.familyName,
    email: profile.emails[0].value,
    photo: profile.photos[0].value
  }
  return Promise.resolve().then(() => {
    return mongo.upsertUser(user);
  }).then(() => {
    return user;
  });
};

function findUserById(id){
  return mongo.findUserById(id)
    .then(user =>{
      return Object.assign(user, {
        jwt_token: makeJWT(user._id)
      })
    });
}
function verifyLocalLogin(email, password){
  return mongo.findUserByEmail(
    email
  ).then(user => {
    const validAccount = (email, password) => {
      return email != '' && password !='';
    }
    if (!user){ // new user
      if(!validAccount(email, password)) throw new Error('invalid account');
    }
    else if(user.password){
      if(user.password != password) throw new Error('password error');
    }
    user['email'] = email;
    user['password'] = password;
    return mongo.upsertUser(user);
  }).then(user => {
    Object.assign(user, {
      jwt_token: makeJWT(user._id)
    })
    return user
  }).catch(err => {
    throw err;  
  });
}
async function verifyGoogleToken(token) {
  const ticket = await GoogleClient.verifyIdToken({
    idToken: token,
    audience: config.google.clientID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const profile = ticket.getPayload();
  //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
  return mongo.findUserByGoogleEmail(
    profile.email
  ).then(user => {
    return upsertGoogleUser(user, token, profile);
  }).then(user => {
    Object.assign(user, {
      jwt_token: makeJWT(user._id)
    })
    console.log(user);
    return user;
  }).catch(err =>{
    console.log(err);
    throw err;
  });
}

exports.verifyGoogleToken = verifyGoogleToken;
exports.verifyLocalLogin = verifyLocalLogin;
exports.routing = function(passport){

  // Strategy to validate facebook token
  passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: config.facebook.appID,
    clientSecret: config.facebook.appSecret 
  }, (token, refreshToken, profile, done) => {
    //return mongo.findUserByFBToken(token).then(user => {
    return mongo.findUserByEmail(
      profile.emails[0].value
    ).then(user => {
      return upsertFacebookUser(user, token, profile);
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

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
  }, (email, password, done) => {
    console.log(email);
    console.log(password);
    return Promise.resolve().then(() => {
      if(email === '' || password === '')
        throw new Error('invalid account');
      return '';
    }).then(() => {
      return mongo.findUserByEmail(email);
    }).then(user => {
      if (!user){ // new user
        user = {};
      }
      else if(user.password){
        if(user.password != password) throw new Error('password error');
      } 
      user['email'] = email;
      user['password'] = password;
      return mongo.upsertUser(user);
    }).then(user => {
      Object.assign(user, {
        jwt_token: makeJWT(user._id)
      })
      return done(null, user)
    }).catch(err => {
      console.log(err.message);
      return done(err);
    });
  }));
}
