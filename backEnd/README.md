# Backend - Flask API Server

Flask backend for BHCARE healthcare management system.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `app.py` | Main Flask application with API endpoints |
| `database.py` | PostgreSQL connection and table initialization |
| `.env` | Database credentials (not in git) |
| `requirements.txt` | Python dependencies |
| `test_connection.py` | Test database connection |
| `view_users.py` | View all users in database |

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
python -m pip install -r requirements.txt
```

### 2. Configure Database
Edit `.env` with your PostgreSQL password:
```env
DB_PASSWORD=your_password
```

### 3. Initialize Database
```powershell
python database.py
```

### 4. Start Server
```powershell
python app.py
```

Server runs on: `http://localhost:5000`

---

## 🔌 API Endpoints

### POST /register
Register a new user with form data.

**Fields**: email, password, first_name, middle_name, last_name, date_of_birth, gender, contact_number, barangay, city, province, id_image (file), ocr_text

### POST /login
User login with JSON.

**Body**: `{ "email": "...", "password": "..." }`

### POST /ocr
Extract text from ID image.

**Body**: Form data with `image` file

### GET /user/<id>
Get user profile by ID.

### PUT /user/<id>
Update user profile.

### GET /user/<id>/photo
Get user's ID photo.

---

## 🛠️ Utilities

### Test Database Connection
```powershell
python test_connection.py
```

### View All Users
```powershell
python view_users.py
```

---

## 📦 Dependencies

- Flask - Web framework
- flask-cors - CORS support
- psycopg2-binary - PostgreSQL driver
- python-dotenv - Environment variables
- Werkzeug - Password hashing
- Pillow - Image processing
- pytesseract - OCR

---

## 🗄️ Database

**Connection**: PostgreSQL  
**Database**: bhcare  
**Table**: users

See `.env` for connection details.

---

## 📝 Notes

- Passwords are hashed using Werkzeug
- ID images stored in `uploads/` folder
- CORS enabled for frontend communication
- SQL injection protection via parameterized queries
