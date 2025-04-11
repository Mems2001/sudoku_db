const { Server } = require("socket.io")
const cookie = require('cookie');
const { verify } = require("jsonwebtoken");

const PlayersService = require('../src/services/players.services')
const MultiplayerGamesService = require('../src/services/multiplayerGames.services')

const timers = {}
const activeRooms = new Set()

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173' , 'https://sudoku21.netlify.app' , 'https://sudoku-db-ip9b.onrender.com'], 
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    },
  });

  // Socket.IO logic
  io.on("connection", (socket) => {
    console.log("Someone is trying to connect")
    const cookies = socket.handshake.headers.cookie
    if (cookies) {
      const parsedCookies = cookie.parse(cookies)
      const accessCookie = parsedCookies['access-token']
      console.log(parsedCookies)
      if (accessCookie) {
        var user_data = verify(accessCookie , process.env.JWT_SECRET)
        // console.log(user_data)
      }
    }

    socket.on('join-room' , async (game_id) => {
      socket.join(game_id)
      activeRooms.add(game_id)
      try {
        const players = await PlayersService.findPlayersByGameId(game_id)
        const game = await MultiplayerGamesService.findMultiplayerGameById(game_id)
        console.log('game status:' , game?.status)
        // Timer
        if (!timers[game_id] && game) {
          timers[game_id] = {timeElapsed: 0 , interval: null}
        }
        socket.emit('game-timer' , timers[game_id].timeElapsed)

        io.to(game_id).emit('updated-players' , players)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('create-player' , async (user_id , game_id) => {
      user_data = {user_id}
      console.log('A user wants to be a player' , user_data.user_id)
      try {
        let existentPlayer = undefined
        const game = await MultiplayerGamesService.findMultiplayerGameById(game_id)
        let players = await PlayersService.findPlayersByGameId(game_id)
        // We check if there already is a Player with that user_id
        players.forEach(player => {
          if (player.user_id === user_id) existentPlayer=player
        })
        if (!existentPlayer) {
          // If not, and if the game has not started then we create the player
          if (game.status === 0) await PlayersService.createPlayerByUserId(user_id , game_id)
          else socket.emit('game-alert' , {message: 'Sorry, the game has already been started'})
        } else {
          socket.emit('player-info' , existentPlayer)
        }
        players = await PlayersService.findPlayersByGameId(game_id)
        io.to(game_id).emit('updated-players' , players)
      } catch (error) {
        console.log('Error creating player:' , error)
        socket.emit('game-alert' , {message: 'Could not create a new player'})
      }
    })

    socket.on('play-game' , async (game_id) => {
      socket.join(game_id)
      try {
        await MultiplayerGamesService.updateMultiplayerGame(game_id , {status: 1})
        console.log('play')
        if (timers[game_id] && !timers[game_id].interval) {
          timers[game_id].interval = setInterval(
            () => {
              timers[game_id].timeElapsed += 1
            }, 1000
          ) 
        }
        io.to(game_id).emit('game-timer' , timers[game_id].timeElapsed)
        io.to(game_id).emit('play-game' , true)
      } catch (error) {
        console.log(error)
      }
    })
    socket.on('pause-game' , async (game_id) => {
      socket.join(game_id)
      console.log('pause')
      try {
        if (timers[game_id] && timers[game_id].interval) {
          clearInterval(timers[game_id].interval)
          timers[game_id].interval = null
          await MultiplayerGamesService.updateMultiplayerGame(game_id, {time: timers[game_id].timeElapsed})
        }
        io.to(game_id).emit('pause-game' , false)
      } catch (error) {
        console.log(error)
      }
    })

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("A user disconnected")

      try {
        for (const room of activeRooms) {
          const sockets = io.sockets.adapter.rooms.get(room)
          console.log(sockets , activeRooms)
          socket.send('Disconected')

          if (user_data) {
            if (sockets && sockets.has(socket.id)) {
              console.log(`Removing user ${user_data.user_id} from room ${room}`)
            }
            const game = await MultiplayerGamesService.findMultiplayerGameById(room)

            if (game.status === 0) {
              await PlayersService.destroyPlayerByUserIdGameId(user_data.user_id , room)
            }

            const players = await PlayersService.findPlayersByGameId(room)
            io.to(room).emit('updated-players' , players)
          }
      
          // If the room is empty, delete the timer and remove the room from activeRooms
          if (!sockets || sockets.size === 0) {
              clearInterval(timers[room]?.interval);
              delete timers[room];
              activeRooms.delete(room)
              console.log(`Timer for room ${room} has been cleared`)
            }
          }
      } catch (error) {
        console.log("Error while disconnection:" , error)
      }

    });
  });

  return io;
};

module.exports = initializeSocket;