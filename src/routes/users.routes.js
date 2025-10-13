const router = require('express').Router();
const usersControllers = require('../controllers/users.controllers');
const { authenticateSession } = require('../middlewares/session.middleware');

router.route('/register')
    .post(usersControllers.register)

router.route('/anon')
    .post(usersControllers.getAnon)

module.exports = router;