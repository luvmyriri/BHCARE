from flask import Blueprint, request, jsonify
from database import get_db_connection
import psycopg2
from psycopg2.extras import RealDictCursor

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
             return jsonify({"error": "User ID is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            SELECT * FROM notifications 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        
        notifications = cursor.fetchall()
        cursor.close()
        conn.close()

        for notif in notifications:
            if notif.get('created_at'):
                notif['created_at'] = notif['created_at'].isoformat()

        return jsonify(notifications), 200

    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify({"error": str(e)}), 500

@notifications_bp.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_as_read(notification_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            UPDATE notifications
            SET is_read = true
            WHERE id = %s
            RETURNING id, is_read
        """, (notification_id,))
        
        updated = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        if not updated:
            return jsonify({"error": "Notification not found"}), 404

        return jsonify(dict(updated)), 200

    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({"error": str(e)}), 500

@notifications_bp.route('/api/notifications/unread-count', methods=['GET'])
def get_unread_count():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
             return jsonify({"error": "User ID is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = %s AND is_read = false
        """, (user_id,))
        
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        return jsonify({"count": count}), 200

    except Exception as e:
        print(f"Error fetching unread count: {e}")
        return jsonify({"error": str(e)}), 500
