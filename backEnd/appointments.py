"""
Appointment Management API Endpoints
Professional appointment booking system for Barangay 174 Health Center
"""
from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime, date, time, timedelta
import psycopg2.extras

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('/api/services', methods=['GET'])
def get_services():
    """Get all available services"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT id, name, description, duration_minutes, is_active
            FROM services
            WHERE is_active = true
            ORDER BY name
        """)
        
        services = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(services), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/available-slots', methods=['GET'])
def get_available_slots():
    """Get available time slots for a specific date"""
    try:
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({"error": "Date parameter is required"}), 400
        
        appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        day_of_week = appointment_date.weekday()  # 0=Monday, 6=Sunday
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get schedule slots for this day
        cursor.execute("""
            SELECT id, start_time, end_time, max_appointments
            FROM schedule_slots
            WHERE day_of_week = %s AND is_active = true
            ORDER BY start_time
        """, (day_of_week,))
        
        slots = cursor.fetchall()
        
        # For each slot, check how many appointments are already booked
        available_slots = []
        for slot in slots:
            cursor.execute("""
                SELECT COUNT(*) as booked_count
                FROM appointments
                WHERE appointment_date = %s
                  AND appointment_time >= %s
                  AND appointment_time < %s
                  AND status NOT IN ('cancelled', 'completed')
            """, (appointment_date, slot['start_time'], slot['end_time']))
            
            booked = cursor.fetchone()['booked_count']
            available = slot['max_appointments'] - booked
            
            if available > 0:
                # Generate specific time slots (every 30 minutes)
                start_time = datetime.combine(appointment_date, slot['start_time'])
                end_time = datetime.combine(appointment_date, slot['end_time'])
                current_time = start_time
                
                while current_time < end_time:
                    # Check if this specific time is available
                    cursor.execute("""
                        SELECT COUNT(*) as count
                        FROM appointments
                        WHERE appointment_date = %s
                          AND appointment_time = %s
                          AND status NOT IN ('cancelled', 'completed')
                    """, (appointment_date, current_time.time()))
                    
                    if cursor.fetchone()['count'] == 0:
                        available_slots.append({
                            'time': current_time.strftime('%H:%M'),
                            'display': current_time.strftime('%I:%M %p'),
                            'available': True
                        })
                    
                    current_time += timedelta(minutes=30)
        
        cursor.close()
        conn.close()
        
        return jsonify(available_slots), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Get all appointments with optional filters"""
    try:
        date_str = request.args.get('date')
        status = request.args.get('status')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = """
            SELECT a.*, 
                   COALESCE(u.first_name, 'Walk-in') as first_name, 
                   COALESCE(u.last_name, a.reason) as last_name, 
                   s.description as service_description
            FROM appointments a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN services s ON a.service_type = s.name
            WHERE 1=1
        """
        params = []
        
        if date_str:
            query += " AND a.appointment_date = %s"
            params.append(date_str)
            
        if status:
            query += " AND a.status = %s"
            params.append(status)
            
        query += " ORDER BY a.appointment_time ASC"
        
        cursor.execute(query, tuple(params))
        appointments = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Serialize fields
        for apt in appointments:
            if apt['appointment_date']:
                apt['appointment_date'] = apt['appointment_date'].isoformat()
            if apt['appointment_time']:
                try:
                    apt['appointment_time'] = apt['appointment_time'].strftime('%H:%M')
                except:
                    pass
            if apt['created_at']:
                apt['created_at'] = apt['created_at'].isoformat()
            if apt['updated_at']:
                apt['updated_at'] = apt['updated_at'].isoformat()

        return jsonify(appointments), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'appointment_date', 'appointment_time', 'service_type']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
        
        user_id = data['user_id']
        appointment_date = data['appointment_date']
        appointment_time = data['appointment_time']
        service_type = data['service_type']
        doctor_preference = data.get('doctor_preference')
        reason = data.get('reason')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if slot is still available
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM appointments
            WHERE appointment_date = %s
              AND appointment_time = %s
              AND status NOT IN ('cancelled', 'completed')
        """, (appointment_date, appointment_time))
        
        if cursor.fetchone()['count'] > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "This time slot is no longer available"}), 409
        
        # Create appointment
        cursor.execute("""
            INSERT INTO appointments 
            (user_id, appointment_date, appointment_time, service_type, 
             doctor_preference, reason, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id, appointment_date, appointment_time, service_type, status, created_at
        """, (user_id, appointment_date, appointment_time, service_type, 
              doctor_preference, reason))
        
        appointment = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "message": "Appointment created successfully",
            "appointment": dict(appointment)
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/appointments/user/<int:user_id>', methods=['GET'])
def get_user_appointments(user_id):
    """Get all appointments for a specific user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT 
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.service_type,
                a.doctor_preference,
                a.reason,
                a.status,
                a.notes,
                a.created_at,
                a.updated_at,
                s.description as service_description,
                s.duration_minutes
            FROM appointments a
            LEFT JOIN services s ON a.service_type = s.name
            WHERE a.user_id = %s
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        """, (user_id,))
        
        appointments = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Convert date/time to strings for JSON serialization
        for apt in appointments:
            if apt['appointment_date']:
                apt['appointment_date'] = apt['appointment_date'].isoformat()
            if apt['appointment_time']:
                apt['appointment_time'] = apt['appointment_time'].strftime('%H:%M')
            if apt['created_at']:
                apt['created_at'] = apt['created_at'].isoformat()
            if apt['updated_at']:
                apt['updated_at'] = apt['updated_at'].isoformat()
        
        return jsonify(appointments), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/appointments/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Get a specific appointment by ID"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT 
                a.*,
                u.first_name,
                u.last_name,
                u.email,
                u.contact_number,
                s.description as service_description,
                s.duration_minutes
            FROM appointments a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN services s ON a.service_type = s.name
            WHERE a.id = %s
        """, (appointment_id,))
        
        appointment = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        # Convert date/time to strings
        appointment = dict(appointment)
        if appointment['appointment_date']:
            appointment['appointment_date'] = appointment['appointment_date'].isoformat()
        if appointment['appointment_time']:
            appointment['appointment_time'] = appointment['appointment_time'].strftime('%H:%M')
        if appointment['created_at']:
            appointment['created_at'] = appointment['created_at'].isoformat()
        if appointment['updated_at']:
            appointment['updated_at'] = appointment['updated_at'].isoformat()
        if appointment['cancelled_at']:
            appointment['cancelled_at'] = appointment['cancelled_at'].isoformat()
        
        return jsonify(appointment), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/appointments/<int:appointment_id>/cancel', methods=['PUT'])
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    try:
        data = request.get_json()
        cancellation_reason = data.get('reason', 'No reason provided')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            UPDATE appointments
            SET status = 'cancelled',
                cancelled_at = CURRENT_TIMESTAMP,
                cancellation_reason = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, status, cancelled_at
        """, (cancellation_reason, appointment_id))
        
        appointment = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        return jsonify({
            "message": "Appointment cancelled successfully",
            "appointment": dict(appointment)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointments_bp.route('/api/appointments/<int:appointment_id>/reschedule', methods=['PUT'])
def reschedule_appointment(appointment_id):
    """Reschedule an appointment"""
    try:
        data = request.get_json()
        
        new_date = data.get('appointment_date')
        new_time = data.get('appointment_time')
        
        if not new_date or not new_time:
            return jsonify({"error": "New date and time are required"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if new slot is available
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM appointments
            WHERE appointment_date = %s
              AND appointment_time = %s
              AND status NOT IN ('cancelled', 'completed')
              AND id != %s
        """, (new_date, new_time, appointment_id))
        
        if cursor.fetchone()['count'] > 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "This time slot is not available"}), 409
        
        # Update appointment
        cursor.execute("""
            UPDATE appointments
            SET appointment_date = %s,
                appointment_time = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, appointment_date, appointment_time, status
        """, (new_date, new_time, appointment_id))
        
        appointment = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        
        return jsonify({
            "message": "Appointment rescheduled successfully",
            "appointment": dict(appointment)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@appointments_bp.route('/api/queue/walk-in', methods=['POST'])
def add_walk_in():
    """Security adds a walk-in patient to the queue"""
    try:
        data = request.get_json()
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        service_type = data.get('service_type', 'Consultation')
        
        if not first_name or not last_name:
            return jsonify({"error": "First name and last name are required"}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if user exists (optional, walk-ins can be unregistered)
        # For simplicity, we'll create a transient entry or link to existing
        # Here we just log it as an appointment for 'today'
        today = date.today().isoformat()
        now_time = datetime.now().strftime('%H:%M')
        
        # We need a user_id. If not provided, we can use a generic 'Walk-in' user 
        # or just allow null if the schema supports it.
        # Assuming for this simplified flow we find or use a placeholder user_id=0 or similar
        # OR better: Security provides the patient's name and we just put it in the queue.
        # Let's assume we want to support unregistered walk-ins by allowing user_id to be NULL 
        # (if DB allows) or mapping them to a special user.
        
        # ACTUALLY: Let's just create a new appt.
        # Check if DB allows NULL user_id for appointments. If not, we'll need to handle that.
        # For now, let's assume we'll just try to insert and see.
        
        cursor.execute("""
            INSERT INTO appointments (user_id, appointment_date, appointment_time, service_type, status, reason)
            VALUES (NULL, %s, %s, %s, 'waiting', 'Walk-in')
            RETURNING id
        """, (today, now_time, service_type))
        # Note: If this fails due to NOT NULL user_id, I'll need to create a placeholder user.
        
        appt_id = cursor.fetchone()['id']
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Walk-in added to queue", "appointment_id": appt_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
