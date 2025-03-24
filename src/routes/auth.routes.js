const router = require('express').Router();
const authController = require('../controllers/auth.controllers');

router.route('/login')
    .post(authController.login)

router.route('/register')
    .post()