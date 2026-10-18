const mongoose = require('mongoose');

// A full 5e-style stat block: the six ability scores, proficiencies, damage
// modifiers, senses, and named traits/actions, on top of the basics
// (size/type, AC, HP, speed, CR). Everything past the core combat line is
// optional, so a quick entry still works without filling in every field.
const abilityScores = new mongoose.Schema({
  str: { type: Number, required: true },
  dex: { type: Number, required: true },
  con: { type: Number, required: true },
  int: { type: Number, required: true },
  wis: { type: Number, required: true },
  cha: { type: Number, required: true }
}, { _id: false });

// Shared shape for a named trait or a named action, each with its rules text
// (e.g. { name: 'Pack Tactics', description: 'Has advantage on an attack
// roll against a creature if at least one of its allies is within 5 feet
// of it and the ally isn't incapacitated.' }).
const namedEntry = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const wildShapeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  creatureType: { type: String, required: true },
  alignment: { type: String },

  armorClass: { type: Number, required: true },
  armorClassNote: { type: String },  // e.g. "natural armor"
  hitPoints: { type: Number, required: true },
  hitDice: { type: String },          // e.g. "5d10 + 10"
  speed: { type: String, required: true },

  abilities: { type: abilityScores, required: true },

  savingThrows: [String],             // e.g. ["Dex +4", "Con +5"]
  skills: [String],                   // e.g. ["Perception +3", "Stealth +4"]

  damageVulnerabilities: [String],
  damageResistances: [String],
  damageImmunities: [String],
  conditionImmunities: [String],

  senses: { type: String },           // e.g. "passive Perception 13"
  languages: { type: String },        // e.g. "—"

  challengeRating: { type: String, required: true },
  xp: { type: Number },

  traits: [namedEntry],               // named traits, e.g. Keen Hearing
  actions: [namedEntry],              // attacks, e.g. Bite, Multiattack

  tags: [String],                     // short quick-glance tags on the card
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WildShape', wildShapeSchema);
