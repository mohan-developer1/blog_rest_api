var mongoose = require('mongoose')

var user_schema = mongoose.Schema({

    _id:mongoose.Schema.Types.ObjectId,
    user_name: {type: String, required: true},
    password:{type: String, required: true},
    wallet:{type:Array}
})

module.exports = mongoose.model('users',user_schema)