const router = require('express').Router()

const gamesControllers = require('../controllers/games.controllers')
const { authenticateSession } = require('../middlewares/session.middleware')

router.route('/')
    .post( authenticateSession , gamesControllers.postGame)

router.route('/:game_id')
    .get(gamesControllers.getGameById)

module.exports = router