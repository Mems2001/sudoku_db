// filepath: socket.js
const { Server } = require("socket.io");
const models = require("../models"); // Import your database models
const uuid = require("uuid");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Allow your React app to connect
      methods: ["GET", "POST"]
    },
  });

  // Socket.IO logic
  io.on("connection", (socket) => {
    console.log("Someone is trying to connect");
    let players = undefined
    socket.on('join-room' , data => {
      if (data.length > 0) {
        players = data
        socket.send('User connected')
      } else {
        socket.send('No users')
      }
    })

    socket.emit('updated-players' , players)

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return io;
};

module.exports = initializeSocket;