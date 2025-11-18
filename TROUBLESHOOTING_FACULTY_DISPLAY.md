# Troubleshooting: Faculty Not Displaying on Floor Selection

## Issue
Faculty cards don't appear when clicking floor buttons, but they appear when searching for a faculty member.

## Debugging Steps

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Click on a block card to navigate to the block detail page
4. Click on a floor button
5. Look for console messages like:
   - `Floor button clicked: ...`
   - `loadFloorData called: blockId=..., floorId=...`
   - `Loaded X faculty for block Y, floor Z:`

### Step 2: Check Server Console
1. Look at your Node.js server terminal/console
2. When you click a floor button, you should see:
   - `Faculty query: blockId=X, floorId=Y, found Z results`
   - `Rooms query: blockId=X, floorId=Y, found Z results`

### Step 3: Verify Database Data

#### Check if faculty exists for that block and floor:
```sql
SELECT * FROM faculties 
WHERE block_id = 1 AND floor_id = 1;
```
(Replace 1 with your actual block_id and floor_id)

#### Check if the floor exists for that block:
```sql
SELECT * FROM floors 
WHERE block_id = 1;
```
(Replace 1 with your actual block_id)

#### Check all blocks and their IDs:
```sql
SELECT id, name FROM blocks;
```

#### Check all floors and their IDs:
```sql
SELECT id, block_id, floor_name FROM floors;
```

### Step 4: Common Issues and Solutions

#### Issue 1: Block ID Mismatch
**Problem:** The `block_id` in your faculty record doesn't match the block ID in the HTML.

**Solution:**
- Check your HTML: `<div class="block-card" data-block-id="1">` means block ID is 1
- Verify in database: `SELECT id, name FROM blocks;`
- Make sure your faculty's `block_id` matches one of these IDs

#### Issue 2: Floor ID Mismatch
**Problem:** The `floor_id` in your faculty record doesn't exist for that block.

**Solution:**
- Check which floors exist for your block:
  ```sql
  SELECT id, floor_name FROM floors WHERE block_id = 1;
  ```
- Make sure your faculty's `floor_id` matches one of these floor IDs

#### Issue 3: Data Type Mismatch
**Problem:** IDs are stored as strings instead of numbers.

**Solution:**
- The code now automatically converts IDs to numbers
- But verify in database that IDs are INT type:
  ```sql
  DESCRIBE faculties;
  DESCRIBE floors;
  DESCRIBE blocks;
  ```

### Step 5: Test with Sample Data

Run this SQL to verify your setup:
```sql
-- Check if you have faculty data
SELECT 
    f.id, 
    f.name, 
    f.block_id, 
    f.floor_id,
    b.name AS block_name,
    fl.floor_name
FROM faculties f
LEFT JOIN blocks b ON f.block_id = b.id
LEFT JOIN floors fl ON f.floor_id = fl.id;
```

This will show you:
- All faculty members
- Their assigned block_id and floor_id
- Whether those blocks and floors exist

### Step 6: Verify Block IDs Match

Your HTML has these block IDs:
- Block 1: CV RAMAN
- Block 2: RAMANUJAN
- Block 3: VISVESVARAYA
- Block 4: APJ ABDUL KALAM
- Block 5: ATAL INCUBATION CENTER

Make sure your database `blocks` table has matching IDs:
```sql
SELECT id, name FROM blocks ORDER BY id;
```

If they don't match, either:
1. Update your HTML `data-block-id` attributes, OR
2. Update your database block IDs to match

### Step 7: Quick Fix - Add Test Data

If you want to quickly test, add a faculty member with known IDs:

```sql
-- First, check what floors exist for block 1
SELECT id, floor_name FROM floors WHERE block_id = 1;

-- Then add a test faculty (replace floor_id with an actual floor ID from above)
INSERT INTO faculties (name, role, email, phone, room, photo, block_id, floor_id) 
VALUES ('Test Faculty', 'Professor', 'test@nmamit.in', '1234567890', '101', NULL, 1, 1);
```

## Expected Console Output

When working correctly, you should see:

**Browser Console:**
```
Rendering 3 floor buttons for block 1: [...]
Floor button clicked: Ground Floor, blockId=1, floorId=1
loadFloorData called: blockId=1, floorId=1, floorName=Ground Floor
Loaded 2 faculty for block 1, floor 1: [...]
Rendering: 2 faculty, 1 rooms
```

**Server Console:**
```
Faculty query: blockId=1, floorId=1, found 2 results
Rooms query: blockId=1, floorId=1, found 1 results
```

## Still Not Working?

1. **Check Network Tab:** In browser DevTools, go to Network tab and see if the API calls are being made and what responses you're getting
2. **Check Server Logs:** Look for any error messages in your server console
3. **Verify Database Connection:** Make sure MySQL is running and the database connection is successful
4. **Check CORS:** Make sure CORS is enabled (it should be in server.js)

## Need More Help?

Share the console output (both browser and server) and I can help identify the specific issue!


