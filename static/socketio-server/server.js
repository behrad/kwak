var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

/* controllers */
var messagesController = function(req, res) {
  var body = req.body;
  io.to(body.channel).emit('message', {
    id: body.id,
    content: body.content,
    topic: body.topic,
    author: body.author
  });
  res.send();
};

var topicsController = function(req, res) {
  var body = req.body;
  io.to(body.channel).emit('topic', {
    id: body.id,
    title: body.title,
    channel: body.channel,
  });
  res.send();
};

/* routes */
app.post('/message', messagesController);
app.post('/topic', topicsController);


/* stuff */
io.on('connection', function(socket) {
  socket.on('join', function(room) {
    console.log('request to join ', room);
    socket.join(room);
  });
  socket.on('leave', function(room) {
    console.log('request to leave ', room);
    socket.leave(room);
  });
});

http.listen(8080, 'localhost', function() {
  console.log('listening on localhost:8080');
});

