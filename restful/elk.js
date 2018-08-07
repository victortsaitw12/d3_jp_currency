const elasticsearch = require('elasticsearch');

module.exports = {
  init: function(){
    return Promise.resolve().then(() => {
      return new elasticsearch.Client({
        host: process.env.ELK_URL,
        log: 'trace'
      });
    });
  }
}
