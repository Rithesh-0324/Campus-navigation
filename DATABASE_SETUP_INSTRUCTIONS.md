# Database Setup Instructions for Campus Connect

## Prerequisites
- XAMPP installed and running
- MySQL service running in XAMPP Control Panel
- phpMyAdmin accessible (usually at http://localhost/phpmyadmin)

## Step-by-Step Setup

### Step 1: Start XAMPP Services
1. Open **XAMPP Control Panel**
2. Start **Apache** (if needed for phpMyAdmin)
3. Start **MySQL** service
4. Verify MySQL is running (green indicator)

### Step 2: Create Database via phpMyAdmin
1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click on **"SQL"** tab at the top
3. Copy and paste the entire contents of `database_setup.sql` file
4. Click **"Go"** button
5. You should see success messages and the database `campus_connect` will be created with all tables

### Alternative: Create Database via MySQL Command Line
1. Open Command Prompt or Terminal
2. Navigate to MySQL bin directory (usually `C:\xampp\mysql\bin` on Windows)
3. Run: `mysql -u root -p` (press Enter if no password, or enter your MySQL root password)
4. Copy and paste the SQL commands from `database_setup.sql`
5. Press Enter to execute

### Step 3: Verify Database Setup
1. In phpMyAdmin, select `campus_connect` database from the left sidebar
2. You should see these tables:
   - `blocks`
   - `floors`
   - `faculties`
   - `rooms`
   - `users`
3. Check that sample data was inserted

### Step 4: Update Database Connection (if needed)
If your MySQL has a password, edit `server.js`:
```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'YOUR_PASSWORD',  // Update this if you set a password
  database: 'campus_connect'
});
```

### Step 5: Add Your Actual Data
The SQL file includes sample data. Replace it with your actual:
- Faculty members (name, role, email, phone, room, photo path, block_id, floor_id)
- Rooms (name, room_number, details, block_id, floor_id)
- Floors for each block

**Example: Adding a new faculty member**
```sql
INSERT INTO faculties (name, role, email, phone, room, photo, block_id, floor_id) 
VALUES ('Dr. Your Name', 'Professor', 'email@nmamit.in', '1234567890', '301', 'faculty/your-photo.jpg', 1, 3);
```

**Example: Adding a new room**
```sql
INSERT INTO rooms (name, room_number, details, block_id, floor_id) 
VALUES ('Advanced Lab', 'AL-301', 'Advanced research laboratory', 1, 3);
```

### Step 6: Test the Search Functionality
1. Make sure your Node.js server is running:
   ```bash
   cd Campus-navigation
   node server.js
   ```
2. Open `index.html` in your browser
3. Type in the search bar (e.g., "Dr. John Smith" or "Electronics Lab")
4. You should see suggestions appear as you type
5. Click a suggestion or press Enter to navigate to the result

## Troubleshooting

### Issue: "DB connect error" in server console
- **Solution**: Check if MySQL is running in XAMPP
- **Solution**: Verify database name is `campus_connect`
- **Solution**: Check if MySQL password is correct in `server.js`

### Issue: "No results found" when searching
- **Solution**: Check if data exists in `faculties` and `rooms` tables
- **Solution**: Verify the search term matches data in the database (case-insensitive)

### Issue: Search suggestions not appearing
- **Solution**: Check browser console for errors (F12)
- **Solution**: Verify server is running on `http://localhost:3000`
- **Solution**: Check Network tab in browser DevTools to see if `/search` endpoint is being called

### Issue: Photos not displaying
- **Solution**: Ensure faculty photos are in `Campus-navigation/public/images/faculty/` folder
- **Solution**: Check that `photo` field in database matches the filename (e.g., `faculty/principal.jpg`)

## Database Schema Overview

### blocks
- `id` (Primary Key)
- `name` (Block name: CV RAMAN, RAMANUJAN, etc.)
- `description` (Optional)
- `image_path` (Optional)

### floors
- `id` (Primary Key)
- `block_id` (Foreign Key → blocks.id)
- `floor_name` (e.g., "Ground Floor", "First Floor")

### faculties
- `id` (Primary Key)
- `name` (Faculty member name)
- `role` (e.g., "Professor", "Associate Professor")
- `email`
- `phone`
- `room` (Room number/name)
- `photo` (Path relative to /images, e.g., "faculty/principal.jpg")
- `block_id` (Foreign Key → blocks.id)
- `floor_id` (Foreign Key → floors.id)

### rooms
- `id` (Primary Key)
- `name` (Room name, e.g., "Electronics Lab")
- `room_number` (Room number, e.g., "EL-101")
- `details` (Description)
- `block_id` (Foreign Key → blocks.id)
- `floor_id` (Foreign Key → floors.id)

### users
- `id` (Primary Key)
- `username` (Unique)
- `password` (Plain text in this setup - hash in production!)

## Next Steps
1. Populate the database with your actual faculty and room data
2. Upload faculty photos to `public/images/faculty/` folder
3. Test the search functionality thoroughly
4. Consider adding more features like filtering, sorting, etc.

