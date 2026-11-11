const WildShape = require('../models/wildshape');

// GET /api/wildshapes — every Wild Shape owned by the logged-in user.
const listWildShapes = async function(req, res) {
  try {
    const wildShapes = await WildShape.find({ owner: req.user._id }).sort({ name: 1 });
    res.status(200).json(wildShapes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/wildshapes/:id — a single Wild Shape, only if it belongs to the caller.
const getWildShape = async function(req, res) {
  try {
    const wildShape = await WildShape.findOne({ _id: req.params.id, owner: req.user._id });
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
      owner: req.user._id
    });
    res.status(201).json(wildShape);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Fields a client is allowed to change with PUT. owner is left out on
// purpose, so a Wild Shape can never be moved into someone else's archive.
const UPDATABLE_FIELDS = [
  'name', 'size', 'creatureType', 'alignment',
  'armorClass', 'armorClassNote', 'hitPoints', 'hitDice', 'speed',
  'abilities', 'savingThrows', 'skills',
  'damageVulnerabilities', 'damageResistances', 'damageImmunities', 'conditionImmunities',
  'senses', 'languages', 'challengeRating', 'xp',
  'traits', 'actions', 'tags'
];
const NUMBER_FIELDS = ['armorClass', 'hitPoints', 'xp'];
const LIST_FIELDS = [
  'savingThrows', 'skills', 'damageVulnerabilities', 'damageResistances',
  'damageImmunities', 'conditionImmunities', 'traits', 'actions', 'tags'
];
const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// PUT /api/wildshapes/:id — update only the fields sent in the JSON body.
// Example body: { "hitPoints": 40, "tags": ["pack", "tracker"] }
const updateWildShape = async function(req, res) {
  // Copy across just the allowed fields that were actually sent
  const updates = {};
  UPDATABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'Send at least one field to update.' });
  }

  for (const field of NUMBER_FIELDS) {
    if (updates[field] === undefined) continue;
    if (Number.isNaN(Number(updates[field]))) {
      return res.status(400).json({ error: `${field} must be a number.` });
    }
    updates[field] = Number(updates[field]);
  }

  for (const field of LIST_FIELDS) {
    if (updates[field] !== undefined && !Array.isArray(updates[field])) {
      return res.status(400).json({ error: `${field} must be an array.` });
    }
  }

  // The ability scores are replaced as one block, so all six are needed
  if (updates.abilities !== undefined) {
    const a = updates.abilities || {};
    if (ABILITY_KEYS.some((k) => Number.isNaN(Number(a[k])))) {
      return res.status(400).json({ error: `abilities must include numeric: ${ABILITY_KEYS.join(', ')}` });
    }
    updates.abilities = {};
    ABILITY_KEYS.forEach((k) => { updates.abilities[k] = Number(a[k]); });
  }

  try {
    // Matching on owner as well as _id means users can only edit their own.
    // runValidators re-checks the schema rules (e.g. required fields) on update.
    const wildShape = await WildShape.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!wildShape) {
      return res.status(404).json({ error: 'No Wild Shape with that id in your archive.' });
    }
    res.status(200).json(wildShape);
  } catch (err) {
    // A badly formed id is a "not found", anything else is bad input
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(404).json({ error: 'No Wild Shape with that id in your archive.' });
    }
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/wildshapes/:id — remove one Wild Shape from the caller's archive.
const deleteWildShape = async function(req, res) {
  try {
    const wildShape = await WildShape.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!wildShape) {
      return res.status(404).json({ error: 'No Wild Shape with that id in your archive.' });
    }
    res.status(200).json({ message: `Deleted ${wildShape.name}.`, id: wildShape._id });
  } catch (err) {
    res.status(404).json({ error: 'No Wild Shape with that id in your archive.' });
  }
};

module.exports = { listWildShapes, getWildShape, createWildShape, updateWildShape, deleteWildShape };