const { authenticateSession } = require('../middlewares/session.middleware')
const MultiplayerGamesController = require('../controllers/multiplayerGames.controllers')

const router = require('express').Router()

router.route('/')
    .post(authenticateSession , MultiplayerGamesController.postMultiplayerGame)

router.route('/:game_id')
    .get(authenticateSession , MultiplayerGamesController.getMultiplayerGameById)

module.exports = router