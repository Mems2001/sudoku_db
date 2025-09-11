const router = require('express').Router()

const PlayersController = require('../controllers/players.controllers')
const { authenticateSession } = require('../middlewares/session.middleware')

router.route('/single/:game_id')
    .get(authenticateSession , PlayersController.getPlayerByGameId)
    .patch(authenticateSession , PlayersController.patchPlayerByGameId)

router.route('/multi/:game_id')
    .get(PlayersController.getConnectedPlayersByGameId)
    .post(authenticateSession , PlayersController.postPlayerByUserId)
    .patch(authenticateSession, PlayersController)

router.route('/on_list/:game_id')
    .get(authenticateSession , PlayersController.getPlayerIsOnList)

module.exports = router