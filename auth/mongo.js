const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://mongo:27017/";

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
    return this.db.findOne({'facebook.email': email}).then(user => {
      // if(!user) throw new Error("USER_NOT_EXIST");
      return user;
    });
  }

  findUserByFBToken(token){
    return this.db.findOne({'facebook.token': token}).then(user => {
      if(!user) throw new Error("user is null");
      return user;
    });
  }

  createUser(user){
    console.log('create user:' + user);
    return this.db.insert(user);
  }

  deleteUser(id){
    return this.db.remove({'id': id});
  }
}

let mongo = new Mongo();
mongo.init();

module.exports = mongo;
