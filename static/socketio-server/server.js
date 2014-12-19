var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  io.emit('message', {
    id: 57,
    content: "content from socketia",
    topic_id: 1,
    author_id: 1
  });
  res.send('hello');
});

app.post('/message', function(req, res) {
  //include channel in req.body, and broadcast to the right namespace/room
  console.log(req.body);
  res.send();
});

io.on('connection', function(socket){
  socket.on('message', function(msg){
    console.log(msg);
    io.emit('message', msg);
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
