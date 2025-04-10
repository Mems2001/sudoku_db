//  Dependencies imports
const cookieParser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const logger = require('morgan')
const http = require('http')
const https = require('https')
const fs = require('fs')
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
app.use(logger())
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

//Cookies settings
app.use((req, res, next) => {
  res.setCookie = (name, value, options = {}) => {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Configuración para CORS
      maxAge: 1000 * 60 * 60 * 24 // 1 día por defecto
    };
    const finalOptions = { ...defaultOptions, ...options };
    res.cookie(name, value, finalOptions);
  };

  res.clearCookie = (name, options = {}) => {
    const defaultOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };
    const finalOptions = { ...defaultOptions, ...options };
    res.clearCookie(name, finalOptions);
  };

  next();
});

//  Accept json & form-urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Socket io
const io = initializeSocket(server)
// io.listen(443)

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

server.listen(port, () => {
        console.log(`Server on PORT: ${port}`)})