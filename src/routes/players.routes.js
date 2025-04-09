const router = require('express').Router()

const PlayersController = require('../controllers/players.controllers')
const { authenticateSession } = require('../middlewares/session.middleware')

router.route('/')

router.route('/:game_id')
    .get(authenticateSession , PlayersController.getPlayersByGameId)
    .post(authenticateSession , PlayersController.postPlayerByUserId)

router.route('/in_list/:game_id')
    .get(authenticateSession , PlayersController.getPlayerIsInList)

module.exports = router