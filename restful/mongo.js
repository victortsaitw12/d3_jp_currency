const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://" + process.env.MONGO_URL + "/";

module.exports = {
  init: function(){
    return MongoClient.connect(url).then(function(db){
      const dbo = db.db("items");
      return dbo.collection("scrapy_items");
    });
  }
}
