const { Server } = require("socket.io");
let io;

module.exports = {
  init: (httpServer) => {
    console.log('Initializing Socket.io...');
    io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}` : '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('Socket.io initialized');
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
