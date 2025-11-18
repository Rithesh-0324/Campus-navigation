# Quick Start Guide - Making Search Bar Work

## ✅ Your Search Bar is Already Implemented!

The search functionality is **already coded** in your project. You just need to set up the database.

## 🚀 Quick Setup (5 minutes)

### Step 1: Start XAMPP
1. Open **XAMPP Control Panel**
2. Click **Start** for **MySQL** service
3. Wait until it shows green (running)

### Step 2: Create Database
1. Open browser → Go to `http://localhost/phpmyadmin`
2. Click **SQL** tab (top menu)
3. Open `database_setup.sql` file from this folder
4. Copy **ALL** the SQL code
5. Paste into phpMyAdmin SQL box
6. Click **Go** button
7. ✅ Database created!

### Step 3: Start Your Server
Open terminal/command prompt in `Campus-navigation` folder:
```bash
node server.js
```

You should see:
```
✅ Connected to MySQL database: campus_connect
🚀 Server running at http://localhost:3000
```

### Step 4: Test Search
1. Open `index.html` in your browser
2. Type in search bar: "Dr. John" or "Electronics"
3. You should see suggestions appear!
4. Click a suggestion or press Enter

## 📊 How Search Works

1. **User types** → Frontend sends request to `/search?q=searchterm`
2. **Server queries** → Searches `faculties` and `rooms` tables
3. **Results returned** → JSON with matching faculty and rooms
4. **Frontend displays** → Shows suggestions dropdown
5. **User clicks** → Navigates to block/floor page with highlighted result

## 🔍 Search Endpoint Details

**URL:** `GET http://localhost:3000/search?q=searchterm`

**Returns:**
```json
{
  "faculty": [
    {
      "id": 1,
      "name": "Dr. John Smith",
      "role": "Professor",
      "block_id": 1,
      "floor_id": 1,
      "floor_name": "Ground Floor",
      "block_name": "CV RAMAN"
    }
  ],
  "rooms": [
    {
      "id": 1,
      "name": "Electronics Lab",
      "room_number": "EL-101",
      "block_id": 1,
      "floor_id": 1
    }
  ]
}
```

## 📝 Adding Your Data

### Add Faculty via SQL:
```sql
INSERT INTO faculties (name, role, email, phone, room, photo, block_id, floor_id) 
VALUES ('Dr. Your Name', 'Professor', 'email@nmamit.in', '1234567890', '301', 'faculty/photo.jpg', 1, 1);
```

### Add Room via SQL:
```sql
INSERT INTO rooms (name, room_number, details, block_id, floor_id) 
VALUES ('Lab Name', 'LAB-101', 'Description here', 1, 1);
```

**Important:** 
- `block_id` must match an existing block (1-5)
- `floor_id` must match an existing floor for that block
- Check `floors` table to see available floor IDs

## 🐛 Troubleshooting

### "No results found"
- ✅ Check if data exists: Run `SELECT * FROM faculties;` in phpMyAdmin
- ✅ Verify search term matches database (case-insensitive)

### "DB connect error"
- ✅ MySQL not running → Start it in XAMPP
- ✅ Database doesn't exist → Run `database_setup.sql`
- ✅ Wrong password → Update `server.js` line 18

### Search suggestions not showing
- ✅ Open browser console (F12) → Check for errors
- ✅ Verify server is running on port 3000
- ✅ Check Network tab → See if `/search` request is made

### Server won't start
- ✅ Install dependencies: `npm install`
- ✅ Check if port 3000 is already in use

## 📸 Adding Faculty Photos

1. Place photos in: `Campus-navigation/public/images/faculty/`
2. Update database: Set `photo` field to `faculty/filename.jpg`
3. Example: If file is `principal.jpg`, set photo = `faculty/principal.jpg`

## 🎯 Next Steps

1. ✅ Database setup (you're here!)
2. 📝 Add your actual faculty data
3. 📝 Add your actual room data  
4. 📸 Upload faculty photos
5. 🧪 Test search with real data

---

**Need help?** Check `DATABASE_SETUP_INSTRUCTIONS.md` for detailed steps.

