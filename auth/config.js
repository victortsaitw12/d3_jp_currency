module.exports = {
  'facebook': {
    'appID': process.env.APP_ID,
    'appSecret': process.env.APP_SECRET,
    'callbackURL': 'http://localhost:8080/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name, last_name, email',
    'profileFields': ['id', 'email', 'name', 'photos']
  },
  'google': {
    'clientID': process.env.GOOGLE_CLIENT_ID,
    'clientSecret': process.env.GOOGLE_CLIENT_SECRET,
    'clientCallback': process.env.GOOGLE_CLIENT_CB
  },
  jwt: {
    'key': process.env.JWT_SECRET
  }
}
