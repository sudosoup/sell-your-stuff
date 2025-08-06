const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    condition TEXT,
    category TEXT,
    location TEXT,
    photoUrl TEXT,
    status TEXT DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/items', (req, res) => {
  const { title, description, condition, category, location, photoUrl } = req.body;
  const stmt = db.prepare(`INSERT INTO items (title, description, condition, category, location, photoUrl) VALUES (?,?,?,?,?,?)`);
  stmt.run(title, description, condition, category, location, photoUrl, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM items WHERE id = ?', this.lastID, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
});

app.post('/api/craigslist', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const script = path.join(__dirname, 'craigslistPoster.js');
  const child = spawn('node', [script, email, password], { stdio: 'inherit' });
  child.on('error', (err) => {
    console.error('Failed to start craigslist script:', err);
  });
  res.json({ status: 'started' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
