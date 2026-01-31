from flask import Flask, jsonify, request
from flask import Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from database import get_db_connection, init_db
import pytesseract
from PIL import Image
import requests
import hashlib
import time
import psycopg2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# OCR API Key
OCR_API_KEY = os.getenv('OCR_API_KEY', 'helloworld')

# TTL 
OCR_CACHE = {}
OCR_CACHE_TTL = 600

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, email, password_hash, first_name, last_name
        FROM users
        WHERE LOWER(email) = LOWER(%s)
    """, (email,))

    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    user_id, user_email, password_hash, first_name, last_name = user

    if not check_password_hash(password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user_id,
            "email": user_email,
            "first_name": first_name,
            "last_name": last_name
        }
    }), 200


@app.route("/register", methods=["POST"])
def register():
    first_name = request.form.get("first_name")
    middle_name = request.form.get("middle_name", "")
    last_name = request.form.get("last_name")
    date_of_birth = request.form.get("date_of_birth")
    gender = request.form.get("gender")
    contact_number = request.form.get("contact_number")
    email = request.form.get("email")
    barangay = request.form.get("barangay")
    city = request.form.get("city")
    province = request.form.get("province")
    password = request.form.get("password")
    ocr_text = request.form.get("ocr_text", "")

    if not all([first_name, last_name, date_of_birth, gender,
                contact_number, email, barangay, city, password]):
        return jsonify({"error": "All fields are required"}), 400
    if not province:
        province = "NCR"

    id_image_path = None
    image_bytes = None
    if "id_image" in request.files:
        file = request.files["id_image"]
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{email}_{datetime.now().timestamp()}_{file.filename}")
            path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(path)
            id_image_path = path
            try:
                with open(path, 'rb') as imgf:
                    image_bytes = imgf.read()
            except:
                image_bytes = None

    password_hash = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO users
            (email, password_hash, first_name, middle_name, last_name,
             date_of_birth, gender, contact_number, barangay, city,
             province, id_image_path, id_image, ocr_text)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            email, password_hash, first_name, middle_name, last_name,
            date_of_birth, gender, contact_number, barangay,
            city, province, id_image_path, image_bytes, ocr_text
        ))

        conn.commit()
        return jsonify({"message": "Registration successful"}), 201

    except psycopg2.IntegrityError as e:
        conn.rollback()
        msg = str(e)
        if 'duplicate key value' in msg and 'email' in msg:
            return jsonify({"error": "Email already exists"}), 409
        return jsonify({"error": "Integrity error"}), 400
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400

    finally:
        cursor.close()
        conn.close()


@app.route("/ocr", methods=["POST"])
def ocr():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(f"temp_{datetime.now().timestamp()}_{file.filename}")
    path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(path)

    try:
        # Compute content hash for caching
        with open(path, 'rb') as fh:
            data_bytes = fh.read()
        content_key = hashlib.sha256(data_bytes).hexdigest()
        cached = OCR_CACHE.get(content_key)
        if cached and (time.time() - cached[1]) < OCR_CACHE_TTL:
            return jsonify({"text": cached[0], "cached": True}), 200

        # Use OCR.space API
        with open(path, 'rb') as f:
            payload = {
                'apikey': OCR_API_KEY,
                'language': 'eng',
                'isOverlayRequired': 'false'
            }
            r = requests.post('https://api.ocr.space/parse/image',
                              files={'file': (filename, f)},
                              data=payload,
                              timeout=30)
        if r.status_code != 200:
            return jsonify({"error": f"OCR service error: {r.text[:200]}"}), 500
        try:
            result = r.json()
        except Exception:
            return jsonify({"error": "Invalid response from OCR service"}), 500
        if not isinstance(result, dict):
            return jsonify({"error": "Unexpected OCR response format"}), 500
        if result.get('IsErroredOnProcessing'):
            msg = result.get('ErrorMessage') or result.get('ErrorDetails') or 'OCR processing error'
            return jsonify({"error": msg}), 400
        text = ""
        parsed = result.get('ParsedResults')
        if isinstance(parsed, list) and parsed:
            item = parsed[0]
            if isinstance(item, dict):
                text = item.get('ParsedText', "") or ""
        if not text:
            return jsonify({"error": "No text parsed from image"}), 400
        OCR_CACHE[content_key] = (text, time.time())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            os.remove(path)

    return jsonify({"text": text}), 200


@app.route("/user/<int:user_id>", methods=["GET", "PUT"])
def user_profile(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == "GET":
        cursor.execute("""
            SELECT id, email, first_name, middle_name, last_name,
                   date_of_birth, gender, contact_number, barangay,
                   city, province
            FROM users
            WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "id": user[0],
            "email": user[1],
            "first_name": user[2],
            "middle_name": user[3],
            "last_name": user[4],
            "date_of_birth": str(user[5]),
            "gender": user[6],
            "contact_number": user[7],
            "barangay": user[8],
            "city": user[9],
            "province": user[10],
        }), 200
    else:
        data = {}
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
        else:
            try:
                data = request.get_json() or {}
            except:
                data = {}
        fields = [
            "first_name", "middle_name", "last_name",
            "date_of_birth", "gender", "contact_number",
            "barangay", "city", "province"
        ]
        updates = []
        values = []
        for f in fields:
            if f in data and data[f] is not None:
                updates.append(f"{f} = %s")
                values.append(data[f])
        # Optional photo update when multipart/form-data with file provided
        image_bytes = None
        new_path = None
        if request.content_type and 'multipart/form-data' in request.content_type and "id_image" in request.files:
            file = request.files["id_image"]
            if file and allowed_file(file.filename):
                filename = secure_filename(f"user_{user_id}_{datetime.now().timestamp()}_{file.filename}")
                path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(path)
                new_path = path
                try:
                    with open(path, 'rb') as imgf:
                        image_bytes = imgf.read()
                except:
                    image_bytes = None
            if new_path is not None:
                updates.append("id_image_path = %s")
                values.append(new_path)
            if image_bytes is not None:
                updates.append("id_image = %s")
                values.append(image_bytes)

        if not updates:
            cursor.close()
            conn.close()
            return jsonify({"error": "No fields to update"}), 400
        values.append(user_id)
        try:
            cursor.execute(f"""
                UPDATE users
                SET {", ".join(updates)}
                WHERE id = %s
            """, tuple(values))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Profile updated"}), 200
        except Exception as e:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({"error": str(e)}), 400

@app.route("/user/<int:user_id>/photo", methods=["GET"])
def user_photo(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_image FROM users WHERE id = %s", (user_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if not row or not row[0]:
        return jsonify({"error": "Photo not found"}), 404
    return Response(row[0], mimetype="image/jpeg")


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
