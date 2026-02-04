# BHCARE - Healthcare Management System

A full-stack healthcare application with React frontend and Flask backend using PostgreSQL database.

---

## 🚀 Quick Start

### Prerequisites
- Node.js & npm
- Python 3.x
- PostgreSQL

### Backend Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/windows/
   - Use password: `0723` (or update `.env`)

2. **Create Database**
   ```sql
   CREATE DATABASE bhcare;
   ```

3. **Install Python Dependencies**
   ```powershell
   cd backEnd
   python -m pip install -r requirements.txt
   ```

4. **Initialize Database**
   ```powershell
   python database.py
   ```

5. **Start Backend Server**
   ```powershell
   python app.py
   ```
   Backend runs on: `http://localhost:5000`

### Frontend Setup

```powershell
cd frontend
npm install
npm start
```

---

## 📁 Project Structure

```
BHCARE/
├── backEnd/           # Flask backend
│   ├── .env          # Database credentials
│   ├── app.py        # Main Flask application
│   ├── database.py   # Database connection & setup
│   ├── requirements.txt
│   └── uploads/      # User ID images
├── frontend/         # React frontend
├── docs/            # Documentation
└── README.md        # This file
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Register new user |
| `/login` | POST | User login |
| `/ocr` | POST | ID scanning with OCR |
| `/user/<id>` | GET | Get user profile |
| `/user/<id>` | PUT | Update user profile |
| `/user/<id>/photo` | GET | Get user ID photo |

---

## 🗄️ Database

**Database**: `bhcare`  
**Table**: `users`

**Credentials** (in `backEnd/.env`):
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `0723`

### 🔄 Database Migrations (Team Collaboration)

**For team members**: When someone changes the database schema, use migrations to stay in sync!

```powershell
# After pulling from Git
cd backEnd
python manage_migrations.py
# Choose option 2: Apply Migrations
```

**See**: [Database Migrations Guide](docs/DATABASE_MIGRATIONS.md) for full workflow

---

## 🛠️ Development Tools

### View Database
```powershell
# Using pgAdmin (GUI)
# Navigate: Servers → PostgreSQL → Databases → bhcare → Tables → users

# Using Python script
cd backEnd
python view_users.py
```

### Test Database Connection
```powershell
cd backEnd
python test_connection.py
```

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- **[Quick Start Guide](docs/QUICK_START.md)** - Step-by-step setup
- **[PostgreSQL Guide](docs/POSTGRESQL_GUIDE.md)** - Database usage
- **[Cheat Sheet](docs/POSTGRESQL_CHEATSHEET.md)** - SQL commands
- **[View Table Guide](docs/HOW_TO_VIEW_TABLE.md)** - How to view data

---

## 🔐 Security Features

- ✅ Password hashing (Werkzeug)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS enabled for frontend
- ✅ Environment variables for sensitive data

---

## 📝 License

[Your License Here]

---

## 👥 Contributors

[Your Team Here]
