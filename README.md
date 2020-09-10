# blog_rest_api
 a Blog application with views, upvotes, comments below are the use cases for the application, the end users are writers and readers, writers can post an article or reply to the comments of his articles
here i am using Mongodb for stroing data
 
for adding users to db
'POST' http://localhost/articles/add-users
 body must contain ex: {"user_name":"testing","password":"password"}
 
to post an article
'POST' http://localhost/articles/userId
body must contain ex: {"description":"something"}

to get article
'GET'  http://localhost/articles/articleId
body must contain ex: {"userid":"5403850040"}

for commenting
'POST' http://localhost/articles/articleId/comment
body must contain ex: {"userid":"5403850040","comment_description":"nice"}

for upvote
'POST' http://localhost/articles/articleId/upvote
body must contain ex: {"userid":"5403850040"}

for replay comment
'POST' http://localhost/articles/articleId/commentId/replaycomment
body must contain ex: {"userid":"5403850040","reply":"ThanQ"}
