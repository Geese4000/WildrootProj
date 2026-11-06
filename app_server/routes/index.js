const express = require('express');
const router = express.Router();
const ctrlMain = require('../controllers/main');
const { ensureAuthenticated } = require('../config/auth');

router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', ctrlMain.login);
router.post('/login', ctrlMain.postLogin);
router.get('/register', ctrlMain.register);
router.post('/register', ctrlMain.postRegister);
router.get('/logout', ctrlMain.logout);
router.get('/archive', ensureAuthenticated, ctrlMain.archive);
router.get('/archive/new', ensureAuthenticated, ctrlMain.newWildShape);
router.post('/archive', ensureAuthenticated, ctrlMain.postWildShape);

module.exports = router;
