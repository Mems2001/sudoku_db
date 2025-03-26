const router = require('express').Router();
const usersControllers = require('../controllers/users.controllers');

router.route('/register')
    .post(usersControllers.register)

module.exports = router;