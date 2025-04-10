//  Dependencies imports
const cookieParser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const http = require('http')
const https = require('https')
const fs = require('fs')
const bodyParser = require('body-parser')
const initializeSocket = require('../socket/socket.js')
require('dotenv').config()

//  Router imports
const authRouter = require('./routes/auth.routes.js')
const sudokusRouter = require('./routes/sudokus.routes.js')
const usersRouter = require('./routes/users.routes.js')
const puzzlesRouter = require('./routes/puzzles.routes.js')
const gamesRouter = require('./routes/games.routes.js')
const multiplayerGamesRouter = require('./routes/multiplayerGames.routes.js')
const playersRouter = require('./routes/players.routes.js')

// Api settings
const app = express()
const port = process.env.PORT
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET
}))
const server = http.createServer(app)
const privateKey = fs.readFileSync('./key.pem', 'utf8');
const certificate = fs.readFileSync('./cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const sserver = https.createServer(credentials, app)

// Cors settings
app.use(cors({
  origin: ['http://localhost:5173' , 'https://sudoku21.netlify.app'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}))

//  Accept json & form-urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Socket io
const io = initializeSocket(sserver)
io.listen(3000)

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'up',
    maintenance: false
  })
})

app.use('/api/v1/auth' , authRouter)
app.use('/api/v1/puzzles' , puzzlesRouter)
app.use('/api/v1/sudokus' , sudokusRouter)
app.use('/api/v1/users' , usersRouter)
app.use('/api/v1/games' , gamesRouter)
app.use('/api/v1/games_vs' , multiplayerGamesRouter)
app.use('/api/v1/players' , playersRouter)

//  Database connection
const db = require("../utils/database.js");

db.authenticate()
    .then(() => console.log("Database correctly authenticated"))
    .catch((err) => console.log(err))
db.sync()
    .then(() => console.log("Database correctly sincronized"))
    .catch((err) => console.log(err))

app.listen(port, () => {
        console.log(`Server on PORT: ${port}`)})