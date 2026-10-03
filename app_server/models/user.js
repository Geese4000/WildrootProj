const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Plain text for now — Report 3 swaps this out for Passport.js with hashed
  // passwords and real sessions. Good enough for the Report 2 milestone
  // (Mongoose schema + Mongo DB, data in controller).
  password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
