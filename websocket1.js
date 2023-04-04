const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  console.log('New user connected');

  // Join a channel
  socket.on('join', (channel) => {
    socket.join(channel);
    console.log(`User joined ${channel}`);
  });

  // Leave a channel
  socket.on('leave', (channel) => {
    socket.leave(channel);
    console.log(`User left ${channel}`);
  });

  // Send a message to a channel
  socket.on('message', (data) => {
    io.to(data.channel).emit('message', data.message);
    console.log(`Message sent to ${data.channel}: ${data.message}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
