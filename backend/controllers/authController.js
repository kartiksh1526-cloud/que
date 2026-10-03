const { PASSWORD } = require('../config');
exports.login = (req, res) => {
  if (req.body.password === PASSWORD) { req.session.ok = true; return res.json({ ok: true }); }
  res.status(401).json({ error: 'Incorrect password.' });
};
exports.logout = (req, res) => req.session.destroy(() => res.json({ ok: true }));
exports.requireAuth = (req, res, next) => req.session.ok ? next() : res.status(401).json({ error: 'login' });
