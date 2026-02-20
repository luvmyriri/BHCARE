from flask import Blueprint, request, jsonify
from database import get_db_connection
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

soap_notes_bp = Blueprint('soap_notes', __name__)

@soap_notes_bp.route('/api/soap-notes', methods=['POST'])
def create_soap_note():
    try:
        data = request.json
        patient_id = data.get('patient_id')
        doctor_email = data.get('doctor_email')  # Email to resolve real doctor id
        subjective = data.get('subjective')
        objective = data.get('objective')
        assessment = data.get('assessment')
        plan = data.get('plan')

        if not patient_id:
            return jsonify({"error": "Patient ID is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Resolve doctor_id from email (look up real users.id in DB)
        doctor_id = None
        if doctor_email:
            cursor.execute("SELECT id, first_name, last_name FROM users WHERE email = %s", (doctor_email,))
            doctor_row = cursor.fetchone()
            if doctor_row:
                doctor_id = doctor_row['id']

        # 1. Insert SOAP Note
        cursor.execute("""
            INSERT INTO soap_notes (patient_id, doctor_id, subjective, objective, assessment, plan)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (patient_id, doctor_id, subjective, objective, assessment, plan))
        
        note = cursor.fetchone()
        note_id = note['id']
        conn.commit()

        # 2. Create Notification for Patient
        notification_message = "Dr. has added a new SOAP note to your file."
        cursor.execute("""
            INSERT INTO notifications (user_id, type, message, related_id)
            VALUES (%s, 'soap_note', %s, %s)
        """, (patient_id, notification_message, note_id))
        
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "SOAP note created successfully",
            "id": note_id,
            "created_at": note['created_at']
        }), 201

    except Exception as e:
        print(f"Error creating SOAP note: {e}")
        return jsonify({"error": str(e)}), 500

@soap_notes_bp.route('/api/soap-notes/<int:patient_id>', methods=['GET'])
def get_patient_notes(patient_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT sn.*, 
                   au.username as doctor_name 
            FROM soap_notes sn
            LEFT JOIN admin_users au ON sn.doctor_id = au.id
            WHERE sn.patient_id = %s
            ORDER BY sn.created_at DESC
        """, (patient_id,))
        
        notes = cursor.fetchall()
        
        cursor.close()
        conn.close()

        # Convert datetime objects to string
        for note in notes:
            if note.get('created_at'):
                note['created_at'] = note['created_at'].isoformat()
            if note.get('updated_at'):
                note['updated_at'] = note['updated_at'].isoformat()

        return jsonify(notes), 200

    except Exception as e:
        print(f"Error fetching SOAP notes: {e}")
        return jsonify({"error": str(e)}), 500

@soap_notes_bp.route('/api/my-soap-notes', methods=['GET'])
def get_my_notes():
    # This endpoint assumes the user is logged in and we can get their ID from session or token (but currently no auth middleware shown in snippet)
    # Using query param for simplicity if needed, or if we had a decorator like @login_required
    # For now, let's assume patient_id is passed as query param or header (since auth is simple here)
    # Actually, let's stick to the pattern used in appointments.py if any.
    # Looking at appointments.py snippet, I don't see auth.
    
    # I'll rely on the frontend passing the patient ID logic if they are authenticated as patient.
    # But usually patients only see their own.
    
    try:
        patient_id = request.args.get('patient_id')
        if not patient_id:
             return jsonify({"error": "Patient ID required"}), 400
             
        return get_patient_notes(patient_id)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@soap_notes_bp.route('/api/doctor/medical-records', methods=['GET'])
def get_all_medical_records():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Fetch recent 50 SOAP notes joined with patient info
        cursor.execute("""
            SELECT 
                sn.id, sn.created_at as appointment_date, sn.assessment as diagnosis,
                u.first_name || ' ' || u.last_name as patient_name,
                u.id as user_id,
                'Dr. ' || d.last_name as doctor_name
            FROM soap_notes sn
            JOIN users u ON sn.patient_id = u.id
            LEFT JOIN users d ON sn.doctor_id = d.id
            ORDER BY sn.created_at DESC
            LIMIT 50
        """)
        
        records = cursor.fetchall()
        
        cursor.close()
        conn.close()

        # Format date
        for r in records:
            if r.get('appointment_date'):
                r['appointment_date'] = r['appointment_date'].strftime('%Y-%m-%d')

        return jsonify(records), 200

    except Exception as e:
        print(f"Error fetching medical records: {e}")
        return jsonify({"error": str(e)}), 500

@soap_notes_bp.route('/api/patients/<int:user_id>/history', methods=['GET'])
def get_patient_history(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Fetch all SOAP notes for this patient
        # doctor_id may reference users.id (for doctor-role users) or admin_users.id (legacy)
        cursor.execute("""
            SELECT 
                sn.*,
                CASE 
                    WHEN u.id IS NOT NULL THEN 'Dr. ' || u.first_name || ' ' || u.last_name
                    WHEN au.id IS NOT NULL THEN 'Dr. ' || au.username
                    ELSE NULL
                END as doctor_name
            FROM soap_notes sn
            LEFT JOIN users u ON sn.doctor_id = u.id
            LEFT JOIN admin_users au ON sn.doctor_id = au.id AND u.id IS NULL
            WHERE sn.patient_id = %s
            ORDER BY sn.created_at DESC
        """, (user_id,))
        
        history = cursor.fetchall()
        
        cursor.close()
        conn.close()

        # Format dates
        for h in history:
            if h.get('created_at'):
                h['created_at'] = h['created_at'].strftime('%Y-%m-%d %H:%M')

        return jsonify(history), 200

    except Exception as e:
        print(f"Error fetching patient history: {e}")
        return jsonify({"error": str(e)}), 500
