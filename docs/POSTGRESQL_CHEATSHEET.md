# PostgreSQL Cheat Sheet for BHCARE

## 🔌 Connection Commands

### Connect to PostgreSQL
```powershell
# Using psql command line
psql -U postgres -d bhcare

# In Python (your app already does this)
from database import get_db_connection
conn = get_db_connection()
```

---

## 📊 Database Commands

### Create Database
```sql
CREATE DATABASE bhcare;
```

### List All Databases
```sql
\l
-- or
SELECT datname FROM pg_database;
```

### Connect to Database
```sql
\c bhcare
```

### Delete Database (⚠️ DANGER!)
```sql
DROP DATABASE bhcare;
```

---

## 📋 Table Commands

### Create Table (already done in database.py)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### List All Tables
```sql
\dt
-- or
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### View Table Structure
```sql
\d users
-- or
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users';
```

### Delete Table (⚠️ DANGER!)
```sql
DROP TABLE users;
```

---

## ➕ INSERT (Create) Commands

### Add Single User
```sql
INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, contact_number, barangay, city, province)
VALUES ('test@example.com', 'hashed_password', 'Juan', 'Cruz', '1990-01-15', 'Male', '09123456789', 'Brgy 1', 'Manila', 'NCR');
```

### Add Multiple Users
```sql
INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, gender, contact_number, barangay, city, province)
VALUES 
    ('user1@test.com', 'hash1', 'Maria', 'Santos', '1995-05-20', 'Female', '09111111111', 'Brgy 2', 'Quezon City', 'NCR'),
    ('user2@test.com', 'hash2', 'Pedro', 'Reyes', '1988-12-10', 'Male', '09222222222', 'Brgy 3', 'Makati', 'NCR');
```

---

## 🔍 SELECT (Read) Commands

### Get All Users
```sql
SELECT * FROM users;
```

### Get Specific Columns
```sql
SELECT first_name, last_name, email FROM users;
```

### Get User by Email
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```

### Get User by ID
```sql
SELECT * FROM users WHERE id = 1;
```

### Search by Name (Case-Insensitive)
```sql
SELECT * FROM users WHERE LOWER(first_name) LIKE LOWER('%juan%');
```

### Count Total Users
```sql
SELECT COUNT(*) FROM users;
```

### Get Recent Users
```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### Get Users by Gender
```sql
SELECT * FROM users WHERE gender = 'Male';
```

### Get Users by City
```sql
SELECT * FROM users WHERE city = 'Manila';
```

### Get Users Registered Today
```sql
SELECT * FROM users WHERE DATE(created_at) = CURRENT_DATE;
```

---

## ✏️ UPDATE (Modify) Commands

### Update User's Name
```sql
UPDATE users 
SET first_name = 'John', last_name = 'Doe' 
WHERE id = 1;
```

### Update User's Contact
```sql
UPDATE users 
SET contact_number = '09999999999' 
WHERE email = 'test@example.com';
```

### Update Multiple Fields
```sql
UPDATE users 
SET 
    first_name = 'Maria',
    city = 'Quezon City',
    province = 'NCR'
WHERE id = 2;
```

### Update All Users in a City
```sql
UPDATE users 
SET province = 'Metro Manila' 
WHERE city = 'Manila';
```

---

## ❌ DELETE Commands

### Delete User by ID
```sql
DELETE FROM users WHERE id = 1;
```

### Delete User by Email
```sql
DELETE FROM users WHERE email = 'test@example.com';
```

### Delete All Users (⚠️ DANGER!)
```sql
DELETE FROM users;
```

### Delete Users by Condition
```sql
DELETE FROM users WHERE city = 'Manila';
```

---

## 🔐 Security & Password Commands

### Hash Password in Python (your app does this)
```python
from werkzeug.security import generate_password_hash, check_password_hash

# Hash password
hashed = generate_password_hash('mypassword123')

# Verify password
is_valid = check_password_hash(hashed, 'mypassword123')
```

### Check if Email Exists
```sql
SELECT EXISTS(SELECT 1 FROM users WHERE email = 'test@example.com');
```

---

## 📈 Advanced Queries

### Group Users by City
```sql
SELECT city, COUNT(*) as user_count 
FROM users 
GROUP BY city 
ORDER BY user_count DESC;
```

### Get Users with Missing Middle Name
```sql
SELECT * FROM users WHERE middle_name IS NULL OR middle_name = '';
```

### Get Users Older Than 30
```sql
SELECT * FROM users 
WHERE date_of_birth < (CURRENT_DATE - INTERVAL '30 years');
```

### Search Multiple Conditions
```sql
SELECT * FROM users 
WHERE city = 'Manila' 
  AND gender = 'Male' 
  AND date_of_birth > '1990-01-01';
```

### Get Unique Cities
```sql
SELECT DISTINCT city FROM users ORDER BY city;
```

---

## 🛠️ Maintenance Commands

### Reset Auto-Increment ID
```sql
ALTER SEQUENCE users_id_seq RESTART WITH 1;
```

### Add New Column
```sql
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
```

### Remove Column
```sql
ALTER TABLE users DROP COLUMN phone_verified;
```

### Rename Column
```sql
ALTER TABLE users RENAME COLUMN contact_number TO phone_number;
```

### View Table Size
```sql
SELECT pg_size_pretty(pg_total_relation_size('users'));
```

### Vacuum (Clean Up)
```sql
VACUUM ANALYZE users;
```

---

## 📤 Backup & Restore

### Backup Database
```powershell
# Full backup
pg_dump -U postgres -d bhcare > backup.sql

# Backup with timestamp
pg_dump -U postgres -d bhcare > backup_2026-02-03.sql

# Backup only data (no schema)
pg_dump -U postgres -d bhcare --data-only > data_backup.sql

# Backup only schema (no data)
pg_dump -U postgres -d bhcare --schema-only > schema_backup.sql
```

### Restore Database
```powershell
# Restore full backup
psql -U postgres -d bhcare < backup.sql

# Create new database and restore
createdb -U postgres bhcare_restored
psql -U postgres -d bhcare_restored < backup.sql
```

---

## 🐛 Debugging Commands

### Show Current Connections
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'bhcare';
```

### Kill Connection
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'bhcare' AND pid <> pg_backend_pid();
```

### Check PostgreSQL Version
```sql
SELECT version();
```

### Show Current User
```sql
SELECT current_user;
```

### Show Current Database
```sql
SELECT current_database();
```

---

## 📊 Useful Queries for Your App

### Get User Profile (Used in /user/<id>)
```sql
SELECT id, email, first_name, middle_name, last_name,
       date_of_birth, gender, contact_number, barangay,
       city, province
FROM users
WHERE id = 1;
```

### Login Query (Used in /login)
```sql
SELECT id, email, password_hash, first_name, last_name
FROM users
WHERE LOWER(email) = LOWER('test@example.com');
```

### Check Duplicate Email (Used in /register)
```sql
SELECT COUNT(*) FROM users WHERE email = 'test@example.com';
```

### Get User Statistics
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_count,
    COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_count,
    COUNT(DISTINCT city) as unique_cities
FROM users;
```

---

## 🎯 Quick Reference

### psql Commands (in psql terminal)
```
\l          - List databases
\c dbname   - Connect to database
\dt         - List tables
\d table    - Describe table
\du         - List users
\q          - Quit
\?          - Help
```

### Data Types
```
SERIAL          - Auto-incrementing integer
VARCHAR(n)      - Variable-length string (max n chars)
TEXT            - Unlimited text
INTEGER         - Whole number
BOOLEAN         - True/False
DATE            - Date (YYYY-MM-DD)
TIMESTAMP       - Date and time
BYTEA           - Binary data (for images)
```

### Common Operators
```
=           - Equal
!=, <>      - Not equal
>           - Greater than
<           - Less than
>=          - Greater than or equal
<=          - Less than or equal
LIKE        - Pattern matching
ILIKE       - Case-insensitive pattern matching
IN          - Match any value in list
BETWEEN     - Range check
IS NULL     - Check for NULL
IS NOT NULL - Check for not NULL
```

---

## 💡 Pro Tips

1. **Always use WHERE clause** when updating/deleting to avoid affecting all rows
2. **Use transactions** for multiple related operations
3. **Index frequently searched columns** (email is already indexed as UNIQUE)
4. **Use LIMIT** when testing queries to avoid overwhelming output
5. **Backup before major changes**
6. **Use parameterized queries** to prevent SQL injection (your app already does this)

---

## 🚨 Safety Checklist

Before running destructive commands:
- [ ] Have a recent backup
- [ ] Double-check your WHERE clause
- [ ] Test on a copy first
- [ ] Understand what the command does
- [ ] Can you undo it?

---

## 📚 Learn More

- PostgreSQL Docs: https://www.postgresql.org/docs/
- SQL Tutorial: https://www.postgresqltutorial.com/
- Practice SQL: https://sqlzoo.net/

---

**Remember**: Your app in `app.py` already handles most of these operations. This cheat sheet is for:
- Manual database inspection
- Debugging
- Data analysis
- Learning SQL
