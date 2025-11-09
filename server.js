const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Connect to MySQL (from XAMPP) ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // default user in XAMPP
  password: '',      // leave blank unless you set one
  database: 'campus-connect'  // make sure this matches your phpMyAdmin DB
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// --- Login API endpoint ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      if (results.length > 0) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Invalid username or password' });
      }
    }
  );
});

// --- Start the server ---
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
