# PostgreSQL Database Setup Instructions

## Step 1: Update Database Password

Edit `backEnd\.env` and replace `your_password_here` with your actual PostgreSQL password:

```
DB_PASSWORD=your_actual_password
```

## Step 2: Create the Database

Open pgAdmin or psql and create the database:

```sql
CREATE DATABASE bhcare;
```

## Step 3: Install Python Dependencies

Navigate to the backend folder and install requirements:

```powershell
cd backEnd
pip install -r requirements.txt
```

## Step 4: Install Tesseract OCR (for ID scanning)

Download and install Tesseract from:
https://github.com/UB-Mannheim/tesseract/wiki

After installation, add Tesseract to your PATH or update `app.py` to specify the path:

```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

## Step 5: Run the Backend

The database tables will be created automatically when you run:

```powershell
python app.py
```

## Step 6: Test the Connection

The backend will be running on `http://localhost:5000`

Your login form is already configured to connect to:
- `/login` - for user authentication
- `/register` - for new user registration
- `/ocr` - for ID scanning

## Database Schema

The `users` table includes:
- id (auto-increment)
- email (unique)
- password_hash (encrypted)
- first_name, middle_name, last_name
- date_of_birth
- gender
- contact_number
- barangay, city, province
- id_image_path
- ocr_text
- created_at (timestamp)

## Notes

- Passwords are automatically hashed using Werkzeug's secure password hashing
- ID images are stored in the `backEnd/uploads` folder
- CORS is enabled to allow your React frontend to communicate with the backend
