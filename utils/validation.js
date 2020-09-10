var mongoose = require('mongoose');
var Comment = require('../models/comments_schema')
var User = require('../models/users_schema');
var config = require('../configuration/config')
module.exports = class validation{
	
	constructor(){

	}

	sendArticleData(article_resp,res){
		try{
			let new_resp = {}
			let filter_views = article_resp['views'].filter((val)=> val !=null)
			new_resp["description"] = article_resp["description"]
			new_resp['views'] = filter_views.length;
			new_resp['upvotes'] = article_resp['upvotes'].length;
			new_resp["comment_url"]= `http://localhost:9999/articles/${article_resp["_id"]}/comment`
			new_resp["upvote_url"] = `http://localhost:9999/articles/${article_resp["_id"]}/upvote`		
			console.log('new_resp: ',new_resp);			
			Comment.find({"post_id":article_resp["_id"]},{'_id':0})
					.select('comment_description reply_description')
					.then((result)=>{
						console.log('new_resp: ',result)
						new_resp['comments'] = result
						res.status(200).json(new_resp)
					})
					.catch((err)=>{
						console.log('err: ',err)
					})
			this.addAndUpdateWallet(new_resp['views'],article_resp['user_id'],article_resp['_id'])
			
		}
		catch(exception){
			console.log('exception: ',exception)
			res.status(500).json("internal server error")
		}
		
	}
	addAndUpdateWallet(views,user_id,post_id){
		console.log('calling wallet function')
		let badge = ''
		if(views >= config['platinum'])
			badge = 'platinum'
		else if (views >= config['gold'])
			badge = 'gold'
		else if (views >= config['silver'])
			badge = 'silver'
		else if (views >= config['bronze'])
			badge = 'bronze'
		console.log('badge:********** ',badge)
		User.updateOne({'_id':user_id,"wallet.post_id":post_id},{$set:{"wallet.$.reward":badge}})
			.then((result)=>{
				console.log('wallet updated: ',result)
			})
			.catch((err)=>{
				console.log('err at rewards: ',err)
			})
	}

}