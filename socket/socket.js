const { Server } = require("socket.io")
const cookie = require('cookie');
const { verify } = require("jsonwebtoken");

const PlayersService = require('../src/services/players.services')

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // Socket.IO logic
  io.on("connection", (socket) => {
    console.log("Someone is trying to connect")
    const cookies = socket.handshake.headers.cookie
    if (cookies) {
      var parsedCookies = cookie.parse(cookies)
      var accessCookie = parsedCookies['access-token']
      console.log(accessCookie)
    }

    socket.on('join-room' , async (game_id) => {
      socket.join(game_id)
      try {
        const players = await PlayersService.findPlayersByGameId(game_id)
        io.to(game_id).emit('updated-players' , players)
      } catch (error) {
        console.log(error)
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return io;
};

module.exports = initializeSocket;