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
// Minimal example body:
// {
//   "name": "Dire Wolf", "size": "Large", "creatureType": "beast",
//   "armorClass": 14, "hitPoints": 37, "speed": "50 ft.", "challengeRating": "1",
//   "abilities": { "str": 17, "dex": 15, "con": 15, "int": 3, "wis": 12, "cha": 7 }
// }
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
  const abilities = req.body.abilities || {};
  const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const missingAbilities = abilityKeys.filter((k) => Number.isNaN(Number(abilities[k])));
  if (missingAbilities.length) {
    return res.status(400).json({ error: `abilities must include numeric: ${abilityKeys.join(', ')}` });
  }

  try {
    const wildShape = await WildShape.create({
      name: req.body.name,
      size: req.body.size,
      creatureType: req.body.creatureType,
      alignment: req.body.alignment,
      armorClass: Number(req.body.armorClass),
      armorClassNote: req.body.armorClassNote,
      hitPoints: Number(req.body.hitPoints),
      hitDice: req.body.hitDice,
      speed: req.body.speed,
      abilities: {
        str: Number(abilities.str),
        dex: Number(abilities.dex),
        con: Number(abilities.con),
        int: Number(abilities.int),
        wis: Number(abilities.wis),
        cha: Number(abilities.cha)
      },
      savingThrows: Array.isArray(req.body.savingThrows) ? req.body.savingThrows : [],
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      damageVulnerabilities: Array.isArray(req.body.damageVulnerabilities) ? req.body.damageVulnerabilities : [],
      damageResistances: Array.isArray(req.body.damageResistances) ? req.body.damageResistances : [],
      damageImmunities: Array.isArray(req.body.damageImmunities) ? req.body.damageImmunities : [],
      conditionImmunities: Array.isArray(req.body.conditionImmunities) ? req.body.conditionImmunities : [],
      senses: req.body.senses,
      languages: req.body.languages,
      challengeRating: req.body.challengeRating,
      xp: req.body.xp !== undefined ? Number(req.body.xp) : undefined,
      traits: Array.isArray(req.body.traits) ? req.body.traits : [],
      actions: Array.isArray(req.body.actions) ? req.body.actions : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      owner: req.session.userId
    });
    res.status(201).json(wildShape);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { listWildShapes, getWildShape, createWildShape };