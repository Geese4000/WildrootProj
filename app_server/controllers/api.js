const WildShape = require('../models/wildshape');

// Shared guard: every /api route needs a logged-in session, same as the
// Pug-rendered /archive routes — just answered as JSON instead of a redirect.
// Log in via POST /login first (e.g. in Postman) to get the session cookie.
function requireSession(req, res) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated. POST /login first to get a session cookie.' });
    return false;
  }
  return true;
}

// GET /api/wildshapes — every Wild Shape owned by the logged-in user.
const listWildShapes = async function(req, res) {
  if (!requireSession(req, res)) return;
  try {
    const wildShapes = await WildShape.find({ owner: req.session.userId }).sort({ name: 1 });
    res.status(200).json(wildShapes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/wildshapes/:id — a single Wild Shape, only if it belongs to the caller.
const getWildShape = async function(req, res) {
  if (!requireSession(req, res)) return;
  try {
    const wildShape = await WildShape.findOne({ _id: req.params.id, owner: req.session.userId });
    if (!wildShape) {
      return res.status(404).json({ error: 'No Wild Shape with that id in your archive.' });
    }
    res.status(200).json(wildShape);
  } catch (err) {
    res.status(404).json({ error: 'No Wild Shape with that id in your archive.' });
  }
};

// POST /api/wildshapes — create one from a JSON body, with basic validation.
const createWildShape = async function(req, res) {
  if (!requireSession(req, res)) return;

  const required = ['name', 'size', 'creatureType', 'armorClass', 'hitPoints', 'speed', 'challengeRating'];
  const missing = required.filter((field) => req.body[field] === undefined || req.body[field] === '');
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
  }
  if (Number.isNaN(Number(req.body.armorClass)) || Number.isNaN(Number(req.body.hitPoints))) {
    return res.status(400).json({ error: 'armorClass and hitPoints must be numbers.' });
  }

  try {
    const wildShape = await WildShape.create({
      name: req.body.name,
      size: req.body.size,
      creatureType: req.body.creatureType,
      armorClass: Number(req.body.armorClass),
      hitPoints: Number(req.body.hitPoints),
      speed: req.body.speed,
      challengeRating: req.body.challengeRating,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      owner: req.session.userId
    });
    res.status(201).json(wildShape);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { listWildShapes, getWildShape, createWildShape };