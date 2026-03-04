const express = require('express');
const router = express.Router();
const User = require('../models/user');
const methodOverride = require('method-override');
const ExpressError = require('../utils/ExpressError');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const usersController = require('../controllers/users');

router.route('/register')
    .get(usersController.userForm)
    .post(wrapAsync(usersController.newUser))

router.route('/login')
    .get(usersController.loginForm)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), usersController.login)

router.get('/logout', usersController.logout)

module.exports = router;