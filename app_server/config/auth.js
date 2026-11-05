// Route guards built on Passport's req.isAuthenticated().

// Page routes: send anyone who isn't logged in to the login screen.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// API routes: answer with a JSON 401 instead of an HTML redirect.
function ensureApiAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated. POST /login first to get a session cookie.' });
}

module.exports = { ensureAuthenticated, ensureApiAuthenticated };