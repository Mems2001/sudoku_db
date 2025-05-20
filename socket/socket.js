const { Server } = require("socket.io")
const cookie = require('cookie');
const { verify } = require("jsonwebtoken");

const PlayersService = require('../src/services/players.services')
const GamesService = require('../src/services/games.services')

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
      } else {
        var user_data = undefined
      }
    }
    
    /**
     * This is the general room creation and joining logic. It also controls the acces of validated players to the game data. Keep in mind that joining a room and joining a game are different operations.
     * @params game_id - id that allows us to control access to the game data in the front-end, sending back player-info as validation.
     */
    socket.on('join-room' , async (game_id) => {
      //Anyone can join the room, but only verified players can access to the game-info. User validation code is declared in the front-end, in VsGame.tsx. This logic will always create a new room and timer, since there will always be a validated player to be the first who joins, the host. This condition is sustained in the front-end logic, in the new game button.
      socket.join(game_id)
      activeRooms.add(game_id)
      try {
        if (user_data) {
          var player = await PlayersService.findPlayerByUserId(user_data.user_id)
        }
        const game = await GamesService.findGameById(game_id)
        console.log('---> game status:' , game?.status)
        // Timer
        if (!timers[game_id] && game) {
          timers[game_id] = {timeElapsed: game.time , interval: null}
        }
        console.log('---> timer set:' , timers[game_id].timeElapsed)
        socket.emit('game-timer' , timers[game_id].timeElapsed)

        //If we don't find a verified player and send back validated player info then the user can not access to the game-info, so, can not join the game. However, for this to happen anyone must be able to join the room since the socket logic is in charge on both getting player info or creating new players if it is the case.
        if (player) {
          if (!player.is_connected) await PlayersService.updatePlayerByGameId(game_id, user_data.user_id, {is_connected:true})
          socket.emit('player-info' , {player_id: player.id , isHost: player.host})
        }

        const players = await PlayersService.findConnectedPlayersByGameId(game_id)
        io.to(game_id).emit('updated-players' , players)
        socket.broadcast.emit('pause-game', false) //In case an authenticaed player is trying to join an on going game, the game will be paused for everyone as soon as he joins.
      } catch (error) {
        console.log(error)
      }
    })

    socket.on('create-player' , async (user_id , game_id) => {
      user_data = {user_id}
      console.log('A user wants to be a player' , user_data.user_id)
      try {
        let existentPlayer = undefined
        const game = await GamesService.findGameById(game_id)
        let players = await PlayersService.findPlayersByGameId(game_id)
        console.log("create-player event data:" , game, players)
        // We check if there already is a Player with that user_id
        players.forEach(player => {
          if (player.user_id === user_id) existentPlayer=player
        })
        if (!existentPlayer) {
          // If not, and if the game has not started then we create the player
          if (game.status === 0) {
            const newPlayer = await PlayersService.createPlayerByUserId(user_id , game_id, {is_connected:true})
            socket.emit('player-info' , {player_id: newPlayer.id , isHost: newPlayer.host})
          }
          else socket.emit('game-alert' , {message: 'Sorry, the game has already been started'})
        } else {
          await PlayersService.updatePlayerByGameId(game_id, user_id, {is_connected:true})
          socket.emit('player-info' , {player_id: existentPlayer.id , isHost: existentPlayer.host})
        }
        players = await PlayersService.findConnectedPlayersByGameId(game_id)
        io.to(game_id).emit('updated-players' , players)
      } catch (error) {
        console.log('Error creating player:' , error)
        socket.emit('game-alert' , {message: 'Could not create a new player'})
      }
    })

    socket.on('play-game' , async (game_id) => {
      // console.log('---> starting game')
      socket.join(game_id)
      try {
        await GamesService.updateGameById(game_id , {status: 1})
        if (timers[game_id] && !timers[game_id].interval) {
          timers[game_id].interval = setInterval(
            () => {
              timers[game_id].timeElapsed += 1
            }, 1000
          ) 
        }
        console.log('---> game started:' , timers[game_id].timeElapsed)
        io.to(game_id).emit('game-timer' , timers[game_id].timeElapsed)
        io.to(game_id).emit('play-game' , true)
      } catch (error) {
        console.log(error)
      }
    })
    socket.on('pause-game' , async (game_id) => {
      socket.join(game_id)
      console.log('---> game paused')
      try {
        if (timers[game_id] && timers[game_id].interval) {
          clearInterval(timers[game_id].interval)
          timers[game_id].interval = null
          await GamesService.updateGameById(game_id, {time: timers[game_id].timeElapsed})
        }
        io.to(game_id).emit('pause-game' , false)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on("multiplayer-gameover" , () => {
      socket.broadcast.emit('multiplayer-gameover', true)
    })

    socket.on('coop-save', data => {
      socket.broadcast.emit('coop-save-2' , data)
    })

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log("---> a user is disconnecting")

      //We'll delete the player if the game has been started or delete the game if there are no more players connected to it. In anycase, the function will always try to simply remove the player (socket) from the correpsonding room.
      try {
        for (const room of activeRooms) {
          console.log("romm:" , room)
          const sockets = io.sockets.adapter.rooms.get(room)
          console.log(sockets , activeRooms)
          const game = await GamesService.findGameById(room)
          console.log('---> game found')

          if (user_data) {
            console.log(user_data)
            console.log(`---> removing user ${user_data.user_id} from room ${room}`)

            //We check if the game has not started yet (game.status === 0), if so, the player table can be deleted, if not, can't be deleted.
            const player = await PlayersService.findPlayerByUserId(user_data.user_id)
            if (game && game.status === 0) {
              await PlayersService.destroyPlayerByUserIdGameId(user_data.user_id , room)
              console.log(`---> player ${player.id} removed from room ${room}, and deleted.`)
            } else {
              await PlayersService.updatePlayerByGameId(room, user_data.user_id, {is_connected:false})
              console.log(`---> player ${player.id} removed from room ${room}, player status updated.`)
            }

            const players = await PlayersService.findConnectedPlayersByGameId(room)
            io.to(room).emit('updated-players' , players)
          }
      
          // If the room is empty, delete the timer and remove the room from activeRooms and delete the game table
          if (!sockets || sockets.size === 0) {
            //We check if the game has been started, if so, we'll keep the game table for player's statistics purposes.
            if (timers[room]?.interval) {
              clearInterval(timers[room].interval)
              timers[room].interval = null
            }
            delete timers[room]
            console.log(`---> timer for room ${room} has been deleted.`)
            if (game && game.status === 0) {
              await GamesService.destroyGameById(room)
              console.log(`---> game ${room} has been deleted.`)
            }
            activeRooms.delete(room)
            console.log(`---> room ${room} is no longer active.`)
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