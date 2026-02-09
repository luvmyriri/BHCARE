# PostgreSQL Implementation Guide for BHCARE

## 📋 Table of Contents
1. [What is PostgreSQL?](#what-is-postgresql)
2. [How Your Project Uses PostgreSQL](#how-your-project-uses-postgresql)
3. [Setup Instructions](#setup-instructions)
4. [Understanding the Database Structure](#understanding-the-database-structure)
5. [How to Use PostgreSQL in Your Project](#how-to-use-postgresql-in-your-project)
6. [Common Operations](#common-operations)
7. [Troubleshooting](#troubleshooting)

---

## 🗄️ What is PostgreSQL?

**PostgreSQL** (often called "Postgres") is a powerful, open-source relational database management system (RDBMS). Think of it as a sophisticated filing cabinet for your application's data.

### Why PostgreSQL?
- ✅ **Reliable**: Industry-standard database used by major companies
- ✅ **Secure**: Built-in encryption and authentication
- ✅ **Scalable**: Can handle millions of records efficiently
- ✅ **Free**: Open-source and completely free to use
- ✅ **Feature-rich**: Supports complex queries, relationships, and data types

---

## 🔧 How Your Project Uses PostgreSQL

Your BHCARE project uses PostgreSQL to store:
- **User accounts** (email, password, personal info)
- **Medical records** (patient data)
- **ID images** (stored as binary data)
- **OCR text** (extracted from ID scans)

### Architecture Overview
```
Frontend (React) 
    ↓ HTTP Requests
Backend (Flask/Python)
    ↓ SQL Queries
PostgreSQL Database
```

---

## 🚀 Setup Instructions

### Step 1: Install PostgreSQL

1. **Download PostgreSQL** from: https://www.postgresql.org/download/windows/
2. **Run the installer** and follow these settings:
   - Port: `5432` (default)
   - Username: `postgres` (default)
   - Password: Choose a strong password (you'll need this!)
   - Remember your password! ⚠️

### Step 2: Configure Your Environment

Your `.env` file already has the configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bhcare
DB_USER=postgres
DB_PASSWORD=0723
```

**⚠️ IMPORTANT**: If you set a different password during installation, update `DB_PASSWORD` in `.env`

### Step 3: Create the Database

**Option A: Using pgAdmin (GUI)**
1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name it: `bhcare`
5. Click "Save"

**Option B: Using Command Line (psql)**
```powershell
# Open PowerShell and run:
psql -U postgres

# Then in the psql prompt:
CREATE DATABASE bhcare;
\q
```

### Step 4: Install Python Dependencies

```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd
pip install -r requirements.txt
```

This installs:
- `psycopg2-binary` - PostgreSQL adapter for Python
- `Flask` - Web framework
- `flask-cors` - Cross-origin resource sharing
- `python-dotenv` - Environment variable management
- `Werkzeug` - Password hashing
- `Pillow` & `pytesseract` - Image processing and OCR

### Step 5: Initialize Database Tables

```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd
python database.py
```

This creates the `users` table with all necessary columns.

### Step 6: Start the Backend Server

```powershell
python app.py
```

You should see:
```
Database tables created successfully!
 * Running on http://127.0.0.1:5000
```

---

## 📊 Understanding the Database Structure

### The `users` Table

| Column Name      | Data Type    | Description                          |
|------------------|--------------|--------------------------------------|
| `id`             | SERIAL       | Auto-incrementing unique identifier  |
| `email`          | VARCHAR(255) | User's email (unique, required)      |
| `password_hash`  | VARCHAR(255) | Encrypted password                   |
| `first_name`     | VARCHAR(100) | First name                           |
| `middle_name`    | VARCHAR(100) | Middle name (optional)               |
| `last_name`      | VARCHAR(100) | Last name                            |
| `date_of_birth`  | DATE         | Birth date                           |
| `gender`         | VARCHAR(20)  | Gender                               |
| `contact_number` | VARCHAR(20)  | Phone number                         |
| `barangay`       | VARCHAR(100) | Barangay address                     |
| `city`           | VARCHAR(100) | City                                 |
| `province`       | VARCHAR(100) | Province                             |
| `id_image_path`  | VARCHAR(255) | File path to ID image                |
| `id_image`       | BYTEA        | Binary image data                    |
| `ocr_text`       | TEXT         | Extracted text from ID               |
| `created_at`     | TIMESTAMP    | Account creation timestamp           |

### Key Concepts

**SERIAL**: Auto-incrementing number (1, 2, 3, ...)
**VARCHAR(n)**: Text with maximum length n
**BYTEA**: Binary data (for storing images)
**TIMESTAMP**: Date and time

---

## 💻 How to Use PostgreSQL in Your Project

### 1. Database Connection (`database.py`)

```python
from database import get_db_connection

# Create a connection
conn = get_db_connection()
cursor = conn.cursor()

# Execute SQL query
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

# Get results
user = cursor.fetchone()  # Get one row
users = cursor.fetchall()  # Get all rows

# Clean up
cursor.close()
conn.close()
```

### 2. Inserting Data (Registration)

```python
cursor.execute("""
    INSERT INTO users 
    (email, password_hash, first_name, last_name, ...)
    VALUES (%s, %s, %s, %s, ...)
""", (email, password_hash, first_name, last_name, ...))

conn.commit()  # Save changes!
```

### 3. Querying Data (Login)

```python
cursor.execute("""
    SELECT id, email, password_hash, first_name, last_name
    FROM users
    WHERE LOWER(email) = LOWER(%s)
""", (email,))

user = cursor.fetchone()
```

### 4. Updating Data (Profile Update)

```python
cursor.execute("""
    UPDATE users
    SET first_name = %s, last_name = %s
    WHERE id = %s
""", (new_first_name, new_last_name, user_id))

conn.commit()
```

### 5. Deleting Data

```python
cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
conn.commit()
```

---

## 🛠️ Common Operations

### View All Users (pgAdmin)

1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL → Databases → bhcare → Schemas → public → Tables → users
3. Right-click "users" → "View/Edit Data" → "All Rows"

### View All Users (SQL)

```sql
SELECT * FROM users;
```

### Count Total Users

```sql
SELECT COUNT(*) FROM users;
```

### Find User by Email

```sql
SELECT * FROM users WHERE email = 'example@email.com';
```

### Delete All Users (⚠️ DANGER!)

```sql
DELETE FROM users;
```

### Reset Auto-Increment ID

```sql
ALTER SEQUENCE users_id_seq RESTART WITH 1;
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

## 🔍 Testing Your Database

### Test Connection

```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd
python test_db.py
```

### Manual Test with Python

Create a file `test_manual.py`:

```python
from database import get_db_connection

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    
    print(f"✅ Connection successful!")
    print(f"📊 Total users: {count}")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
```

Run it:
```powershell
python test_manual.py
```

---

## 🐛 Troubleshooting

### Error: "password authentication failed"

**Solution**: Update your password in `.env` file
```env
DB_PASSWORD=your_actual_password
```

### Error: "database 'bhcare' does not exist"

**Solution**: Create the database
```sql
CREATE DATABASE bhcare;
```

### Error: "could not connect to server"

**Solutions**:
1. Check if PostgreSQL is running:
   - Open Services (Win + R → `services.msc`)
   - Find "postgresql-x64-XX" service
   - Make sure it's "Running"

2. Check the port:
   ```powershell
   netstat -an | findstr 5432
   ```

### Error: "relation 'users' does not exist"

**Solution**: Initialize the database
```powershell
python database.py
```

### Error: "psycopg2 module not found"

**Solution**: Install dependencies
```powershell
pip install -r requirements.txt
```

---

## 📚 Additional Resources

### Official Documentation
- PostgreSQL Docs: https://www.postgresql.org/docs/
- psycopg2 Docs: https://www.psycopg.org/docs/

### Tutorials
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
- SQL Basics: https://www.w3schools.com/sql/

### Tools
- **pgAdmin**: GUI for PostgreSQL management
- **DBeaver**: Universal database tool (alternative to pgAdmin)
- **TablePlus**: Modern database GUI (paid but has free tier)

---

## 🎯 Quick Reference

### Start Backend Server
```powershell
cd c:\Apache24\htdocs\BHCARE\backEnd
python app.py
```

### View Database in pgAdmin
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Navigate to bhcare → Schemas → public → Tables → users

### Reset Database
```powershell
# Drop and recreate
psql -U postgres -c "DROP DATABASE bhcare;"
psql -U postgres -c "CREATE DATABASE bhcare;"
python database.py
```

### Check Backend Logs
Look at the terminal where `python app.py` is running

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to Git (add to `.gitignore`)
2. **Use strong passwords** for database users
3. **Always hash passwords** (already done with `generate_password_hash`)
4. **Use parameterized queries** to prevent SQL injection (already implemented with `%s`)
5. **Limit database user permissions** in production
6. **Regular backups** of your database

---

## 📝 Summary

You now have:
- ✅ PostgreSQL installed and configured
- ✅ Database connection established
- ✅ Tables created and ready to use
- ✅ Backend API endpoints working
- ✅ Understanding of how to query and manipulate data

**Next Steps**:
1. Test the registration endpoint from your frontend
2. Test the login endpoint
3. Verify data is being saved in PostgreSQL
4. Monitor the database using pgAdmin

Need help? Check the troubleshooting section or review the code in `database.py` and `app.py`!
