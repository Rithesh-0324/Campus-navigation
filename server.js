// final server.js - Campus Connect backend
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors()); // allow frontend dev server to call API
app.use(express.json()); // parse JSON payloads

// Serve static images from public/images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// MySQL connection - update user/password if different
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',   // change if you set a root password
  database: 'campus_connect'
});

// Connect to MySQL once during startup
db.connect(err => {
  if (err) {
    console.error('❌ DB connect error:', err.message);
    console.error('💡 Make sure:');
    console.error('   1. MySQL is running in XAMPP');
    console.error('   2. Database "campus_connect" exists');
    console.error('   3. Password is correct (if set)');
    console.error('\n📝 Run database_setup.sql in phpMyAdmin to create the database\n');
  } else {
    console.log('✅ Connected to MySQL database: campus_connect');
  }
});

// Handle connection errors
db.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('❌ Database connection lost. Attempting to reconnect...');
  } else {
    console.error('❌ Database error:', err);
  }
});

/*
  LOGIN endpoint
  Assumes you have table `users (id, username, password)`
  Passwords are in plaintext in this prototype; in production hash them.
*/
// Minimal credential check for the admin modal
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
  const sql = 'SELECT id FROM users WHERE username = ? AND password = ? LIMIT 1';
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (results.length > 0) return res.json({ success: true, message: 'Login successful' });
    return res.json({ success: false, message: 'Invalid username or password' });
  });
});

// GET floors of a block
// Return floors so the frontend can draw buttons
app.get('/floors/:blockId', (req, res) => {
  const blockId = req.params.blockId;
  const sql = 'SELECT id, floor_name FROM floors WHERE block_id = ? ORDER BY id';
  db.query(sql, [blockId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results || []);
  });
});

// GET faculty for block + floor
// Faculty listing filtered by block/floor
app.get('/faculty/:blockId/:floorId', (req, res) => {
  const blockId = parseInt(req.params.blockId, 10);
  const floorId = parseInt(req.params.floorId, 10);
  
  if (isNaN(blockId) || isNaN(floorId)) {
    return res.status(400).json({ error: 'Invalid blockId or floorId' });
  }
  
  const sql = `
    SELECT f.id, f.name, f.role, f.email, f.phone, f.room, f.photo
    FROM faculties f
    WHERE f.block_id = ? AND f.floor_id = ?
    ORDER BY f.name
  `;
  db.query(sql, [blockId, floorId], (err, results) => {
    if (err) {
      console.error('Faculty query error:', err);
      return res.status(500).json({ error: 'DB error', details: err.message });
    }
    console.log(`Faculty query: blockId=${blockId}, floorId=${floorId}, found ${results?.length || 0} results`);
    res.json(results || []);
  });
});

// GET rooms for block + floor
// Room listing filtered by block/floor
app.get('/rooms/:blockId/:floorId', (req, res) => {
  const blockId = parseInt(req.params.blockId, 10);
  const floorId = parseInt(req.params.floorId, 10);
  
  if (isNaN(blockId) || isNaN(floorId)) {
    return res.status(400).json({ error: 'Invalid blockId or floorId' });
  }
  
  const sql = `
    SELECT r.id, r.name, r.room_number, r.details
    FROM rooms r
    WHERE r.block_id = ? AND r.floor_id = ?
    ORDER BY r.name
  `;
  db.query(sql, [blockId, floorId], (err, results) => {
    if (err) {
      console.error('Rooms query error:', err);
      return res.status(500).json({ error: 'DB error', details: err.message });
    }
    console.log(`Rooms query: blockId=${blockId}, floorId=${floorId}, found ${results?.length || 0} results`);
    res.json(results || []);
  });
});

// SEARCH endpoint - returns { faculty: [...], rooms: [...] }
// Each result includes block_id, floor_id, floor_name and block_name for frontend navigation.
// Combined search so the UI can deep-link to a floor
app.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ faculty: [], rooms: [] });

  const like = `%${q}%`;

  // Faculty search: join floors and blocks to get names
  const facultySQL = `
    SELECT 
      'faculty' AS type,
      f.id, f.name, f.role, f.email, f.phone, f.room AS room_number, f.photo,
      f.block_id, f.floor_id,
      fl.floor_name,
      b.name AS block_name
    FROM faculties f
    JOIN floors fl ON f.floor_id = fl.id
    JOIN blocks b ON f.block_id = b.id
    WHERE f.name LIKE ?
    LIMIT 25
  `;

  // Room search
  const roomSQL = `
    SELECT
      'room' AS type,
      r.id, r.name, r.room_number, r.details,
      r.block_id, r.floor_id,
      fl.floor_name,
      b.name AS block_name
    FROM rooms r
    JOIN floors fl ON r.floor_id = fl.id
    JOIN blocks b ON r.block_id = b.id
    WHERE r.name LIKE ? OR r.room_number LIKE ?
    LIMIT 25
  `;

  db.query(facultySQL, [like], (err, facultyResults) => {
    if (err) {
      console.error('search faculty error', err);
      return res.status(500).json({ faculty: [], rooms: [] });
    }
    db.query(roomSQL, [like, like], (err2, roomResults) => {
      if (err2) {
        console.error('search room error', err2);
        return res.status(500).json({ faculty: facultyResults || [], rooms: [] });
      }
      // return both lists
      return res.json({
        faculty: facultyResults || [],
        rooms: roomResults || []
      });
    });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
