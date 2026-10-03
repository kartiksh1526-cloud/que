const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, 'quotations.db'));
db.exec(`CREATE TABLE IF NOT EXISTS quotations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qno TEXT, customer TEXT, total REAL, data TEXT,
  created TEXT DEFAULT CURRENT_TIMESTAMP, updated TEXT DEFAULT CURRENT_TIMESTAMP)`);
module.exports = db;
