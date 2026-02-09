# 📊 How to View Your Database Table

## 🎯 Quick Answer

**The easiest way is using pgAdmin!**

---

## Method 1: pgAdmin (Recommended) 👍

### Step 1: Open pgAdmin
- Press **Windows key**
- Type **"pgAdmin"**
- Click on **pgAdmin 4**

### Step 2: Connect to Server
- Click on **"Servers"** in the left panel
- Click on **"PostgreSQL XX"** (may ask for password: `0723`)

### Step 3: Navigate to Your Table
Follow this path in the left sidebar:
```
Servers
 └─ PostgreSQL 16
    └─ Databases
       └─ bhcare ← Your database
          └─ Schemas
             └─ public
                └─ Tables
                   └─ users ← YOUR TABLE HERE!
```

### Step 4: View the Data
- **Right-click** on **"users"**
- Select **"View/Edit Data"** → **"All Rows"**
- 🎉 You'll see your data in a spreadsheet!

### Visual Guide
See the image above for a visual walkthrough!

---

## Method 2: SQL Query in pgAdmin 💻

1. Open pgAdmin
2. Right-click on **"bhcare"** database
3. Click **"Query Tool"**
4. Type:
   ```sql
   SELECT * FROM users;
   ```
5. Click **▶️ Execute** (or press F5)

### Useful Queries:
```sql
-- View all users
SELECT * FROM users;

-- Count users
SELECT COUNT(*) FROM users;

-- View only names and emails
SELECT first_name, last_name, email FROM users;

-- Recent users
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- Search by email
SELECT * FROM users WHERE email = 'test@example.com';
```

---

## Method 3: Python Script 🐍

I've created a script for you! Just run:

```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd
python view_users.py
```

This will show a formatted table of all users in your terminal.

### Sample Output:
```
================================================================================
📊 Total Users: 3
================================================================================

ID    Email                     First Name      Last Name       Gender      City      
--------------------------------------------------------------------------------
1     john@example.com          John            Doe             Male        Manila    
2     maria@example.com         Maria           Santos          Female      Quezon    
3     pedro@example.com         Pedro           Cruz            Male        Makati    
================================================================================
```

---

## Method 4: Command Line (psql) ⌨️

```powershell
# Connect to database
psql -U postgres -d bhcare

# View table structure
\d users

# View all data
SELECT * FROM users;

# Exit
\q
```

---

## 🎯 Which Method Should I Use?

| Method | Best For | Difficulty |
|--------|----------|------------|
| **pgAdmin** | Visual browsing, editing data | ⭐ Easy |
| **SQL Query** | Running custom queries | ⭐⭐ Medium |
| **Python Script** | Quick terminal view | ⭐ Easy |
| **psql** | Command line lovers | ⭐⭐⭐ Advanced |

**Recommendation**: Use **pgAdmin** - it's the easiest and most visual!

---

## 📝 Current Status

Your table is currently **empty** (no users yet).

To add users:
1. Start your backend: `python app.py`
2. Use your React frontend to register a user
3. Check pgAdmin to see the new user!

---

## 🔍 What You'll See in the Table

Once you have users, you'll see columns like:

| Column | Example |
|--------|---------|
| id | 1 |
| email | john@example.com |
| password_hash | $2b$12$... (encrypted) |
| first_name | John |
| middle_name | Dela |
| last_name | Doe |
| date_of_birth | 1990-01-15 |
| gender | Male |
| contact_number | 09123456789 |
| barangay | Barangay 1 |
| city | Manila |
| province | NCR |
| id_image_path | uploads/john_123.jpg |
| id_image | [binary data] |
| ocr_text | Extracted text... |
| created_at | 2026-02-03 22:57:00 |

---

## 💡 Pro Tips

1. **Refresh the view** in pgAdmin: Right-click → Refresh
2. **Edit data directly** in pgAdmin: Just click on a cell and type
3. **Export data**: Right-click → Import/Export
4. **Filter data**: Use the filter icon in pgAdmin's data view
5. **Sort data**: Click on column headers

---

## 🆘 Troubleshooting

### Can't find pgAdmin?
- Search in Windows Start menu
- Or reinstall PostgreSQL with pgAdmin option checked

### Can't connect in pgAdmin?
- Make sure PostgreSQL service is running
- Check password is `0723`

### Table is empty?
- This is normal! Register a user from your frontend first
- Or insert test data using SQL

### Don't see "bhcare" database?
- Right-click "Databases" → Refresh
- Or create it: Right-click → Create → Database

---

## 🎉 Quick Start

**Want to see your table right now?**

1. Open **pgAdmin**
2. Navigate to: **Servers → PostgreSQL → Databases → bhcare → Schemas → public → Tables → users**
3. Right-click **users** → **View/Edit Data** → **All Rows**

That's it! 🚀

---

*For more SQL commands, check `POSTGRESQL_CHEATSHEET.md`*
