const { authenticateSession } = require('../middlewares/session.middleware')
const profilesControllers = require('../controllers/profiles.controllers')

const router = require('express').Router()

router.route('/game-settings')
    .patch(authenticateSession, profilesControllers.patchGameSettings)

router.route('/my-profile')
    .get(authenticateSession, profilesControllers.getMyProfile)

module.exports = router