//  Dependencies imports
const cookieParser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

//  Router imports
const authRouter = require('./routes/auth.routes.js')
const sudokusRouter = require('./routes/sudokus.routes.js')
const usersRouter = require('./routes/users.routes.js')
const puzzlesRouter = require('./routes/puzzles.routes.js')
const gamesRouter = require('./routes/games.routes.js')

// Api settings
const app = express()
const port = process.env.PORT
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET
}))

// Cors settings
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

//  Accept json & form-urlencoded
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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