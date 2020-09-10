var mongoose = require('mongoose')

var articles_schmea = mongoose.Schema({
	_id : mongoose.Schema.Types.ObjectId,
	user_id :{type: mongoose.Schema.Types.ObjectId, ref: 'users_schema', required: true},
	description:{type: String, required: true},
	views : {type: Array,  default : []},
	upvotes:{type: Array,  default : []}
})

module.exports = mongoose.model('articles',articles_schmea)