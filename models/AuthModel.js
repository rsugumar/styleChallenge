var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AuthModel = new Schema ({
   email: String,
   password: String
}, {collection: 'Auth'} );

module.exports = mongoose.model('Auth', AuthModel);
