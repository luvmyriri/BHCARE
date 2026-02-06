# 🚀 Quick Start Guide - PostgreSQL for BHCARE

## What You Need to Know

PostgreSQL is already **implemented** in your project! Your backend code is ready to use it. You just need to set it up.

---

## ⚡ 5-Minute Setup

### Step 1: Install PostgreSQL (if not installed)

1. Download from: https://www.postgresql.org/download/windows/
2. Run installer with these settings:
   - **Port**: 5432
   - **Username**: postgres
   - **Password**: `0723` (or your preferred password)
3. Install **pgAdmin** (comes with PostgreSQL)

### Step 2: Create the Database

**Option A - Using pgAdmin (Easiest)**:
1. Open **pgAdmin**
2. Connect to PostgreSQL (use password from Step 1)
3. Right-click "Databases" → Create → Database
4. Name: `bhcare`
5. Click Save

**Option B - Using Command Line**:
```powershell
# Open PowerShell as Administrator
psql -U postgres
# Enter your password when prompted
# Then type:
CREATE DATABASE bhcare;
\q
```

### Step 3: Update Password (if different)

If you used a different password than `0723`, edit `backEnd\.env`:
```env
DB_PASSWORD=your_password_here
```

### Step 4: Install Python Packages

```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd

# Try this first:
python -m pip install Flask flask-cors python-dotenv Werkzeug Pillow pytesseract

# For PostgreSQL driver, try:
python -m pip install psycopg2-binary
```

**If psycopg2-binary fails**, download the wheel file:
1. Go to: https://www.lfd.uci.edu/~gohlke/pythonlibs/#psycopg
2. Download the file matching your Python version (e.g., `psycopg2‑2.9.9‑cp312‑cp312‑win_amd64.whl` for Python 3.12)
3. Install it:
```powershell
python -m pip install path\to\downloaded\file.whl
```

### Step 5: Initialize Database Tables

```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd
python database.py
```

You should see: `Database tables created successfully!`

### Step 6: Start the Backend

```powershell
python app.py
```

You should see:
```
Database tables created successfully!
 * Running on http://127.0.0.1:5000
```

---

## 🎯 How It Works

### Your Backend Structure

```
backEnd/
├── .env                    # Database credentials
├── database.py             # Database connection & table creation
├── app.py                  # Flask API endpoints
├── requirements.txt        # Python dependencies
└── uploads/                # Uploaded ID images
```

### What Each File Does

**`.env`** - Stores your database password securely
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bhcare
DB_USER=postgres
DB_PASSWORD=0723
```

**`database.py`** - Handles database connections
```python
def get_db_connection():
    # Creates connection to PostgreSQL
    
def init_db():
    # Creates the 'users' table
```

**`app.py`** - Your API endpoints
- `/login` - User login
- `/register` - User registration
- `/ocr` - ID scanning
- `/user/<id>` - Get/update user profile

---

## 📊 Understanding Your Database

### The `users` Table

When you register a user, this data is saved:

| What Gets Saved      | Example                    |
|---------------------|----------------------------|
| Email               | user@example.com           |
| Password (hashed)   | $2b$12$... (encrypted)    |
| First Name          | Juan                       |
| Middle Name         | Dela                       |
| Last Name           | Cruz                       |
| Date of Birth       | 1990-01-15                 |
| Gender              | Male                       |
| Contact Number      | 09123456789                |
| Barangay            | Barangay 1                 |
| City                | Manila                     |
| Province            | NCR                        |
| ID Image (binary)   | [binary data]              |
| OCR Text            | Extracted text from ID     |
| Created At          | 2026-02-03 22:22:21        |

---

## 🔍 How to View Your Data

### Using pgAdmin (GUI)

1. Open **pgAdmin**
2. Navigate: Servers → PostgreSQL → Databases → bhcare → Schemas → public → Tables → users
3. Right-click "users" → View/Edit Data → All Rows

### Using SQL Queries

In pgAdmin, click "Query Tool" and run:

```sql
-- View all users
SELECT * FROM users;

-- Count total users
SELECT COUNT(*) FROM users;

-- Find specific user
SELECT * FROM users WHERE email = 'test@example.com';

-- View recent registrations
SELECT first_name, last_name, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 💻 How Your Frontend Uses It

### Registration Flow

```javascript
// Frontend sends this:
const formData = new FormData();
formData.append('email', 'user@example.com');
formData.append('password', 'password123');
formData.append('first_name', 'Juan');
// ... other fields

fetch('http://localhost:5000/register', {
    method: 'POST',
    body: formData
})
```

```python
# Backend receives it and saves to PostgreSQL:
@app.route("/register", methods=["POST"])
def register():
    # Get data from request
    email = request.form.get("email")
    password = request.form.get("password")
    
    # Hash password for security
    password_hash = generate_password_hash(password)
    
    # Save to database
    cursor.execute("""
        INSERT INTO users (email, password_hash, ...)
        VALUES (%s, %s, ...)
    """, (email, password_hash, ...))
    
    conn.commit()  # Save changes!
```

### Login Flow

```javascript
// Frontend sends:
fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
})
```

```python
# Backend checks PostgreSQL:
@app.route("/login", methods=["POST"])
def login():
    # Find user in database
    cursor.execute("""
        SELECT id, email, password_hash, first_name, last_name
        FROM users
        WHERE email = %s
    """, (email,))
    
    user = cursor.fetchone()
    
    # Verify password
    if check_password_hash(user[2], password):
        return {"message": "Login successful"}
```

---

## 🛠️ Common Tasks

### Check if PostgreSQL is Running

```powershell
# Open Services
services.msc

# Find "postgresql-x64-XX" and make sure it's "Running"
```

### Restart PostgreSQL

```powershell
# In Services, right-click postgresql service
# Click "Restart"
```

### View Backend Logs

Just look at the terminal where you ran `python app.py`

### Reset Database (Delete All Users)

```sql
-- In pgAdmin Query Tool:
DELETE FROM users;
```

### Backup Database

```powershell
pg_dump -U postgres -d bhcare > backup.sql
```

### Restore Database

```powershell
psql -U postgres -d bhcare < backup.sql
```

---

## ❌ Common Errors & Fixes

### "password authentication failed"

**Fix**: Update password in `.env` file

### "database 'bhcare' does not exist"

**Fix**: Create database in pgAdmin or run:
```sql
CREATE DATABASE bhcare;
```

### "could not connect to server"

**Fix**: 
1. Check PostgreSQL service is running
2. Check port 5432 is not blocked

### "relation 'users' does not exist"

**Fix**: Run `python database.py`

### "psycopg2 module not found"

**Fix**: Install it:
```powershell
python -m pip install psycopg2-binary
```

---

## 🎓 Learning Resources

### What is SQL?

SQL (Structured Query Language) is how you talk to databases.

**Basic Commands**:
```sql
-- Create
INSERT INTO users (email, password) VALUES ('test@test.com', 'hash');

-- Read
SELECT * FROM users WHERE email = 'test@test.com';

-- Update
UPDATE users SET first_name = 'John' WHERE id = 1;

-- Delete
DELETE FROM users WHERE id = 1;
```

### Why Use PostgreSQL vs Files?

| Files (JSON/CSV)        | PostgreSQL                |
|------------------------|---------------------------|
| ❌ Slow with many users | ✅ Fast even with millions |
| ❌ No security          | ✅ Built-in security       |
| ❌ Hard to search       | ✅ Powerful search (SQL)   |
| ❌ No relationships     | ✅ Can link tables         |
| ❌ Corruption risk      | ✅ ACID compliant          |

### Useful Links

- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
- SQL Basics: https://www.w3schools.com/sql/
- psycopg2 Docs: https://www.psycopg.org/docs/

---

## ✅ Checklist

Before running your app, make sure:

- [ ] PostgreSQL is installed
- [ ] PostgreSQL service is running
- [ ] Database `bhcare` exists
- [ ] `.env` has correct password
- [ ] Python packages installed (`psycopg2-binary`, `Flask`, etc.)
- [ ] Tables created (`python database.py`)
- [ ] Backend running (`python app.py`)

---

## 🎉 You're Ready!

Your PostgreSQL database is now:
- ✅ Storing user accounts securely
- ✅ Encrypting passwords
- ✅ Handling ID images
- ✅ Processing OCR text
- ✅ Ready for your frontend to use

**Test it**:
1. Start backend: `python app.py`
2. Open your React frontend
3. Try registering a new user
4. Check pgAdmin to see the data!

Need more help? Check `POSTGRESQL_GUIDE.md` for detailed explanations.
