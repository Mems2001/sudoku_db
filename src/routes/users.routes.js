const router = require('express').Router();
const usersControllers = require('../controllers/users.controllers');
const { authenticateSession } = require('../middlewares/session.middleware');

router.route('/register')
    .post(usersControllers.register)

router.route('/anon')
    .get(usersControllers.getAnon)

router.route('/game_settings')
    .patch(authenticateSession, usersControllers.patchGameSettings)

module.exports = router;