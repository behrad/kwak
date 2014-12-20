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
  io.emit('message', {
    id: body.id,
    content: body.content,
    topic: body.topic,
    author: body.author
  });
  res.send();
};

var topicsController = function(req, res) {
  var body = req.body;
  io.emit('topic', {
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
  socket.on('message', function(msg) {
    console.log(msg);
    io.emit('message', msg);
  });
});

http.listen(8080, 'localhost', function() {
  console.log('listening on localhost:8080');
});

