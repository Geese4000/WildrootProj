const express = require('express');
const router = express.Router();
const ctrlApi = require('../controllers/api');
const { ensureApiAuthenticated } = require('../config/auth');

// JSON API over the same WildShape data the Pug views use. Every route needs
// a Passport login (session cookie from POST /login).
router.use(ensureApiAuthenticated);

router.get('/wildshapes', ctrlApi.listWildShapes);
router.post('/wildshapes', ctrlApi.createWildShape);
router.get('/wildshapes/:id', ctrlApi.getWildShape);
router.put('/wildshapes/:id', ctrlApi.updateWildShape);
router.delete('/wildshapes/:id', ctrlApi.deleteWildShape);

module.exports = router;