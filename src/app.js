//Dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

//Router imports
const sudokuRouter = require('./routes/sudoku.routes.js');

// Api settings
const app = express();
const port = process.env.PORT;

// Cors settings
const whitelist = [`https://localhost:${port}`]
const corsOptions = {
  origin: (origin , callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback (null , true)
    } else {
      callback(new Error('Denied by CORS'))
    }
  }
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  app.use(cors())
  app.use(helmet({crossOriginResourcePolicy: false}))
} else {
  app.use(cors(corsOptions))
}

//  Accept json & form-urlencoded
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Routes
app.get('/', (req , res) => {
  res.status(200).json({
    status: 'up' ,
    maintenance: false
  })
});

app.use('/api/v1/sudokus' , sudokuRouter);

//Database connection
const db = require("../utils/database.js");

db.authenticate()
    .then(() => console.log("Database correctly authenticated"))
    .catch((err) => console.log(err))
db.sync()
    .then(() => console.log("Database correctly sincronized"))
    .catch((err) => console.log(err))

app.listen(port, () => {
        console.log(`Server on PORT: ${port}`)})