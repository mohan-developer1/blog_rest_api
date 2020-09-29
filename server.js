var http = require('http')
var app = require('./app_middleware.js')
const PORT = process.env.PORT || 9999
http.createServer(app).listen(PORT,()=>{
	console.log("server started on port 9999 ")
})
