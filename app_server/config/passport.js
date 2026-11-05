const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// One generic message for both "no such email" and "wrong password", so the
// login form never reveals which email addresses have accounts.
const LOGIN_FAILED = 'Email or password is incorrect.';

module.exports = function (passport) {
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return done(null, false, { message: LOGIN_FAILED });

        const match = await user.comparePassword(password);
        if (!match) return done(null, false, { message: LOGIN_FAILED });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // Only the user's id goes into the session cookie's server-side record
  passport.serializeUser((user, done) => done(null, user.id));

  // On every request, turn that id back into req.user (without the hash)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};