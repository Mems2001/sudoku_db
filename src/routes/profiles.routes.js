const { authenticateSession } = require('../middlewares/session.middleware')
const profilesControllers = require('../controllers/profiles.controllers')

const router = require('express').Router()

router.route('/game-settings')
    .patch(authenticateSession, profilesControllers.patchGameSettings)

module.exports = router