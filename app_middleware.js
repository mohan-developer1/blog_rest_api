var express = require('express')
var app = express();
var morgan = require('morgan')
var articles = require('./routes/articles.js')
var cors = require('cors')
var mongoose = require('mongoose')
var config = require('./configuration/config.json')
var mongoDB = process.env.MONGODB_URI || config['mongodb_url'];
mongoose.connect(mongoDB, { useNewUrlParser: true });
app.use(morgan('dev'))
app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use('/articles',articles)
app.use((req,res,next)=>{
	const error = new Error("Url Not found")
	error.status = 404;
	next(error)
})
app.use((error,req,res,next)=>{
	res.status(error.status || 500);
	res.json({
		message:error.message
	})
})
module.exports = app;
