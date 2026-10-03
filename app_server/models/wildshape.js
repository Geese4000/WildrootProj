const mongoose = require('mongoose');

const wildShapeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creatureType: { type: String, required: true },
  armorClass: { type: Number, required: true },
  hitPoints: { type: Number, required: true },
  tags: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WildShape', wildShapeSchema);
