var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')
var User = require('../models/users_schema');
const rateLimit = require("express-rate-limit");
var validation = require('../utils/validation.js')
var Article = require('../models/articles_schema')
var Comment = require('../models/comments_schema')
var {check, oneOf, validationResult} = require('express-validator')
var validation_ref = new validation();


const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10
});


router.get('/',(req,res,next)=>{
	Article.find()
			.select("_id")
			.exec()
			.then((result)=>{
				let new_resp = result.map((obj)=>{
					let obj_new = {}
					obj_new["article_id"]= obj["_id"]
					obj_new["url"] = `http://localhost:9999/articles/${obj["_id"]}`
					return obj_new;
				})
				res.status(200).json(new_resp)
			})
			.catch((err)=>{
				res.status(500).json("internal error")
			})
})

router.get('/:articalId',apiLimiter,oneOf([ check('userid').exists()]),(req,res,next)=>{
	const errors = validationResult(req)
	console.log(errors)
	if(!errors.isEmpty()){
		res.status(400).json("userid missing")
		return
	}
	const id = req.params.articalId
	let user_id = req.body.userid
	console.log('user_id: ',user_id)
	User.findById(user_id)
		.then((result)=>{
			console.log(result)
			return Article.findById(id)
						  .exec()
		})
		.then((article_resp)=>{
			if(article_resp){
				console.log('article_resp: ',article_resp)
				Article.updateOne({_id:id}, {$addToSet:{views: user_id}},(err,docs)=>{
					if(err){
						console.log(err)
					}
					else{
						console.log('views case: ',docs)
						validation_ref.sendArticleData(article_resp,res);
					}
				})				
				//Article.updateOne({_id:id}, {$addToSet:{views: user_id}})
			}
			else{
				res.status(404).json({message:'No valid entry for provided ID'})
				return
			}			
		})
		.catch((err)=>{
			console.log(err)
			res.status(500).json('user not found')
		})
})

router.post('/add-users',(req,res,next)=>{

	console.log('for adding users: ',req.originalUrl)
	console.log('user name: ',req.body.user_name)
	console.log('password: ',req.body.password)
	var user = new User({
		_id : new mongoose.Types.ObjectId(),
		user_name : req.body.user_name,
		password: req.body.password
	})
	user.save().then((result)=>{
		console.log(result)
		res.status(201).json({
			message:"user is sucessfully inserted",
			user_id:result["_id"]
		})
	})
	.catch((err)=>{
		console.log('error:  ',err)
		res.status(500).json({
			message:'unable to create new users'
		})
	})
	
})

router.post('/:userId',oneOf([ check('description').exists()]),(req,res,next)=>{
	console.log('for posting article')
	const errors = validationResult(req)
	if(!errors.isEmpty()){
		res.status(400).json("description is missing")
		return
	}
	const id = req.params.userId
	let description = req.body.description;
	User.findById(id)
		.exec()
		.then((result)=>{
			var article_ref = new Article({
				_id : new mongoose.Types.ObjectId(),
				user_id: id,
				description: description
			})
			return article_ref.save()
		})
		.then((result)=>{
			User.update({'_id':id},{$push:{wallet:{'post_id':result['_id'],'reward':""}}})
				.then()
				.catch((err)=>{
					console.log("err: ",err)
				})
			res.status(201).json({
				message: 'your article is successfully posted',
				aritcle_id:result["_id"]
			})
		})
		.catch((err)=>{
			res.status(500).json({
				message:'error while posting'
			})
		})
})

router.post('/:articleId/comment',oneOf([ check('userid').exists()]),(req,res,next)=>{
	const errors = validationResult(req)
	if(!errors.isEmpty()){
		res.status(400).json("userid is missing")
		return
	}
	const id = req.params.articleId;
	let user_id = req.body.userid;
	let comment_des = req.body.comment_description;
	User.findById(user_id)
	.exec()
	.then((result)=>{
		var comment_ref = new Comment({
			_id : new mongoose.Types.ObjectId(),
			user_id: user_id,
			post_id: id,
			comment_description: comment_des,
			reply_description:''
		})
		return comment_ref.save()
	})
	.then((result)=>{
		console.log('result comment: ',result)
		res.status(201).json({
			message: 'You commented on the article',
			comment: result['comment_description'],
			commentId:result["_id"]
		})
	})
	.catch((err)=>{
		console.log(err["_message"])
		res.status(500).json({
			message:err["_message"]
		})
	})
})
router.post('/:articalId/upvote',oneOf([ check('userid').exists()]),(req,res,next)=>{
	const errors = validationResult(req)
	if(!errors.isEmpty()){
		res.status(400).json("userid is missing")
		return
	}
	const id = req.params.articalId
	let user_id = req.body.userid
	User.findById(user_id)
	.then((result)=>{
		console.log(result)
		return Article.updateOne({_id:id}, {$addToSet:{upvotes: user_id}})			
	})
	.then((resp)=>{
		if(resp){
			msg = 'You liked the article'
			if(resp['nModified'] == 0)
				msg='You already did that'
			res.status(201).json(msg)
		}
		else{
			res.status(404).json({message:'No valid user id'})
		}			
	})
	.catch((err)=>{
		console.log(err)
		res.status(500).json('user not found')
	})
})
router.post('/:articalId/:commentId/reply-comment',oneOf([ [check('userid').exists().withMessage("userid is required"),check('reply').exists().withMessage("reply description is required")]]),(req,res,next)=>{
	const errors = validationResult(req)
	if(!errors.isEmpty()){
		res.status(400).json(errors.array())
		return
	}
	const id = req.params.articalId;
	let commentId = req.params.commentId;
	let user_id = req.body.userid;
	let reply_desc = req.body.reply;
	Article.findById(id)
		.select('user_id')
		.then((result)=>{
			console.log('result: ',result)
			if(result["user_id"] == user_id){
				console.log("you are article writer")
				Comment.updateOne(
      				{ "_id" : commentId },
      				{ $set: { "reply_description" : reply_desc } }
   				)
   				.then((result)=>{
   					res.status(200).json("You have given a reply comment")
   				})
   				.catch((err)=>{
   					res.status(500).json("reply failed")
   				})
			}
			else{
				res.status(200).json("you are not article writer to reply comment")
			}
		})
		.catch((err)=>{
			console.log(err)
			res.status(500).json("please check aritcle_id once")
		})
})
module.exports = router;