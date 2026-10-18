const express = require('express');
const router = express.Router();
const ctrlApi = require('../controllers/api');

// A small JSON API over the same WildShape data the Pug views use. Session
// based, same as the rest of the app — Report 3 is where this moves to
// Passport, not before.
router.get('/wildshapes', ctrlApi.listWildShapes);
router.post('/wildshapes', ctrlApi.createWildShape);
router.get('/wildshapes/:id', ctrlApi.getWildShape);

module.exports = router;