const r = require('express').Router();
const c = require('../controllers/authController');
r.post('/login', c.login);
r.post('/logout', c.logout);
r.get('/me', c.requireAuth, (req, res) => res.json({ ok: true }));
module.exports = r;
