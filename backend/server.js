const express = require('express');
const session = require('express-session');
const path = require('path');
const { SECRET, PORT, PASSWORD, GENERATED_PASSWORD } = require('./config');
const app = express();
const FRONT = path.join(__dirname, '..', 'frontend');

app.use(express.json({ limit: '1mb' }));
app.use(session({ secret: SECRET, resave: false, saveUninitialized: false, cookie: { maxAge: 1000 * 60 * 60 * 12 } }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/quotations', require('./routes/quotations'));

// Allow the login page and its required assets before authentication.
const open = ['/login.html', '/css/style.css', '/js/auth.js'];
app.use((req, res, next) => (req.session.ok || open.includes(req.path) || req.path.startsWith('/images/')) ? next() : res.redirect('/login.html'));
app.get('/', (req, res) => res.redirect('/dashboard.html'));
app.use(express.static(FRONT));

app.listen(PORT, () => {
  console.log(`JK Quotation System is running at http://localhost:${PORT}`);
  if (GENERATED_PASSWORD) {
    console.log(`Temporary login password: ${PASSWORD}`);
    console.log('Set APP_PASSWORD in your environment to use a password of your choice.');
  }
});
