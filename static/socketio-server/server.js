var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  io.emit('message', {
    id: 57,
    content: "content from socketia",
    topic_id: 1,
    author_id: 1
  });
  res.send();
});

io.on('connection', function(socket){
  socket.on('message', function(msg){
    io.emit('message', msg);
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
