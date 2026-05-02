const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_room', (room) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on('new_appointment', (data) => {
      io.emit('new_appointment', data);
    });

    socket.on('patient_called', (data) => {
      io.emit('patient_called', data);
    });

    socket.on('bed_status_update', (data) => {
      io.emit('bed_status_update', data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
