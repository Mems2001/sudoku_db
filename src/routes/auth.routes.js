const router = require('express').Router();
const authController = require('../controllers/auth.controllers');

router.route('/login')
    .post(authController.login)

router.route('/logout')
    .get(authController.logout)

router.route('/authenticate_session')
    .get(authController.authenticateSession)

module.exports = router;