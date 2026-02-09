from flask import Blueprint, jsonify, request
from database import get_db_connection
import psycopg2.extras
from datetime import datetime

security_bp = Blueprint('security', __name__)

@security_bp.route('/api/visits/log', methods=['POST'])
def log_visit():
    """Log a visitor entry or exit"""
    try:
        data = request.get_json()
        visitor_name = data.get('visitor_name')
        purpose = data.get('purpose')
        visit_type = data.get('type', 'entry')
        user_id = data.get('user_id') # Optional link to registered user

        if not visitor_name or not purpose:
            return jsonify({"error": "Visitor name and purpose are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO visit_logs (user_id, visitor_name, purpose, type)
            VALUES (%s, %s, %s, %s)
            RETURNING id, timestamp
        """, (user_id, visitor_name, purpose, visit_type))
        
        log_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": f"Visitor {visit_type} logged successfully", "id": log_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@security_bp.route('/api/visits/daily-stats', methods=['GET'])
def get_daily_stats():
    """Get visitor statistics for today"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        today = datetime.now().date()
        
        # Total visitors today (unique entries)
        cursor.execute("""
            SELECT COUNT(*) as total
            FROM visit_logs
            WHERE type = 'entry' AND timestamp::date = %s
        """, (today,))
        total_visitors = cursor.fetchone()['total']
        
        # Current occupancy calculation
        cursor.execute("""
            SELECT 
                (SELECT COUNT(*) FROM visit_logs WHERE type = 'entry' AND timestamp::date = %s) -
                (SELECT COUNT(*) FROM visit_logs WHERE type = 'exit' AND timestamp::date = %s)
            as occupancy
        """, (today, today))
        occupancy = cursor.fetchone()['occupancy']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "total_visitors": total_visitors,
            "current_occupancy": max(0, occupancy)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@security_bp.route('/api/appointments/<int:appointment_id>/check-in', methods=['POST'])
def check_in_appointment(appointment_id):
    """Generate a queue number and mark as waiting"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        today = datetime.now().date()
        
        # Get next queue number for today
        cursor.execute("""
            SELECT COALESCE(MAX(queue_number), 0) + 1 
            FROM appointments 
            WHERE appointment_date = %s
        """, (today,))
        next_queue = cursor.fetchone()[0]
        
        cursor.execute("""
            UPDATE appointments 
            SET status = 'waiting', queue_number = %s 
            WHERE id = %s
            RETURNING id
        """, (next_queue, appointment_id))
        
        if not cursor.fetchone():
            return jsonify({"error": "Appointment not found"}), 404
            
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Checked in successfully", "queue_number": next_queue}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@security_bp.route('/api/center-status', methods=['GET'])
def get_center_status():
    """Get summarized status for public display"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        today = datetime.now().date()
        
        # 1. Waiting count
        cursor.execute("SELECT COUNT(id) as count FROM appointments WHERE status = 'waiting' AND appointment_date = %s", (today,))
        waiting_count = cursor.fetchone()['count']
        
        # 2. Daily capacity (Assume 50 slots per day base on schedule_slots x services)
        # For simplicity, let's say max is 40
        max_capacity = 40
        cursor.execute("SELECT COUNT(id) as count FROM appointments WHERE appointment_date = %s", (today,))
        total_booked = cursor.fetchone()['count']
        
        occupancy_rate = (total_booked / max_capacity) * 100 if max_capacity > 0 else 0
        
        status_label = "OPEN"
        color = "green"
        message = "Low waiting time"
        
        if occupancy_rate >= 95:
            status_label = "FULL"
            color = "red"
            message = "We are at full capacity for today"
        elif occupancy_rate >= 75:
            status_label = "BUSY"
            color = "orange"
            message = "High volume of patients"
        elif waiting_count > 5:
            status_label = "MODERATE"
            color = "yellow"
            message = f"Moderate wait (~{waiting_count * 10} mins)"

        cursor.close()
        conn.close()
        
        return jsonify({
            "status": status_label,
            "color": color,
            "message": message,
            "waiting_count": waiting_count,
            "remaining_slots": max(0, max_capacity - total_booked)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
