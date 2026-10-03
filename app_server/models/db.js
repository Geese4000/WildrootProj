const mongoose = require('mongoose');

// Falls back to a local MongoDB for dev if MONGODB_URI isn't set, but on
// Render (and for the Atlas-backed grading deploy) MONGODB_URI must be set
// as an environment variable — never commit a real connection string.
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost/wildroot';

mongoose.connect(dbURI);

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI.replace(/\/\/.*@/, '//<credentials>@')}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

module.exports = mongoose;
