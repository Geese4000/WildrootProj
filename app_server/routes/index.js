const express = require('express');
const router = express.Router();
const ctrlMain = require('../controllers/main');

router.get('/', (req, res) => res.redirect('/login'));
router.get('/login', ctrlMain.login);
router.get('/register', ctrlMain.register);
router.get('/archive', ctrlMain.archive);

module.exports = router;
