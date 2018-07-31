const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://" + process.env.MONGO_URL + "/";

class Mongo{
  constructor(){
    this.db = null;
  }
  init(){
    return MongoClient.connect(url).then(db => {
      const dbo = db.db("account");
      this.db = dbo.collection("user");
    });
  }

  findUserById(id){
    return this.db.findOne({"id": id});
  }

  findUserByEmail(email){
    return this.db.findOne({'email': email}).then(user => {
      return user;
    });
  }

  findUserByFacebookEmail(email){
    return this.db.findOne({'facebook.email': email}).then(user => {
      return user;
    });
  }

  findUserByGoogleEmail(email){
    return this.db.findOne({'google.email': email}).then(user => {
      return user;
    });
  }

  findUserByFBToken(token){
    return this.db.findOne({'facebook.token': token}).then(user => {
      if(!user) throw new Error("user is null");
      return user;
    });
  }

  upsertUser(user){
    if(user.facebook){
      user.email = user.facebook.email;
    }
    if(user.google){
      user.email = user.google.email;
    }
    user.updated_dt = Date.now();
    return this.db.update({
      'email': user.email
    }, user, {'upsert': 1}).then(result => {
      return user;  
    });
  }

  deleteUser(id){
    return this.db.remove({'id': id});
  }
}

let mongo = new Mongo();
mongo.init();

module.exports = mongo;
