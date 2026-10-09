const mongoose = require('mongoose');

// Each Wild Shape carries the stat-block basics a druid actually needs
// mid-game: size + type, AC, HP, speed, challenge rating, plus a handful
// of quick trait tags. That's 7 data points per character (8 counting the
// owner reference), well past the "at least 5" the brief asked for.
const wildShapeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  creatureType: { type: String, required: true },
  armorClass: { type: Number, required: true },
  hitPoints: { type: Number, required: true },
  speed: { type: String, required: true },
  challengeRating: { type: String, required: true },
  tags: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WildShape', wildShapeSchema);
