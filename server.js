var http = require('http')
var app = require('./app_middleware.js')


http.createServer(app).listen(9999,()=>{
	console.log("server started on port 9999 ")
})