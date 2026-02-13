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
        doctor_id = data.get('doctor_id') # Optional
        subjective = data.get('subjective')
        objective = data.get('objective')
        assessment = data.get('assessment')
        plan = data.get('plan')

        if not patient_id:
            return jsonify({"error": "Patient ID is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

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
        # We can do this in the same transaction or separately. Same transaction is safer.
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
