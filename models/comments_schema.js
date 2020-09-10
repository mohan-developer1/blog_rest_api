var mongoose = require('mongoose')

var comments_schema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    user_id :{type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    post_id :{type: mongoose.Schema.Types.ObjectId,ref: 'articles', required: true},
    comment_description:{type: String, required: true},
    reply_description:{type: String}
})

module.exports = mongoose.model('comments',comments_schema)