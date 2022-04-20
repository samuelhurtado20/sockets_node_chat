const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var users = [];

io.on('connection', (socket) => {
  //console.log('a user connected');

  socket.on('login', (user) => {
    user.id = socket.id;
    users.push(user);
    //console.log(users);
    io.emit('login', users);
  });

  socket.on('chat_msj', (userName, msg, sendTo = null) => {
    if (sendTo) {
      io.to(sendTo).emit('chat_msj', userName, msg, true);
      io.to(socket.id).emit('chat_msj', userName, msg, true);
    } else {
      io.emit('chat_msj', userName, msg, false);
    }
  });

  socket.on('disconnect', () => {
    //console.log('disconnecting..');
    users.forEach((element) => {
      for (var i = 0; i < users.length; i++) {
        if (users[i].id === element.id) {
          users.splice(i, 1);
        }
      }
    });
    //console.log('user disconnected');
    io.emit('login', users);
    //console.log(users);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
