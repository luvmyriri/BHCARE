from flask import Blueprint, jsonify, request
from database import get_db_connection
import psycopg2.extras
from datetime import datetime

lab_results_bp = Blueprint('lab_results', __name__)

@lab_results_bp.route('/api/lab-results', methods=['GET'])
def get_lab_results():
    try:
        status = request.args.get('status')
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = """
            SELECT lr.*, u.first_name, u.last_name 
            FROM lab_results lr
            JOIN users u ON lr.patient_id = u.id
        """
        params = []
        
        if status:
            query += " WHERE lr.status = %s"
            params.append(status)
            
        query += " ORDER BY lr.requested_at DESC"
        
        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Format dates
        for r in results:
            if r['requested_at']:
                r['requested_at'] = r['requested_at'].isoformat()
            if r['completed_at']:
                r['completed_at'] = r['completed_at'].isoformat()
                
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lab_results_bp.route('/api/lab-results', methods=['POST'])
def create_lab_result():
    try:
        data = request.get_json()
        required = ['patient_id', 'test_type']
        for field in required:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
                
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            INSERT INTO lab_results (patient_id, test_type, is_urgent, status)
            VALUES (%s, %s, %s, 'pending')
            RETURNING *
        """, (data['patient_id'], data['test_type'], data.get('is_urgent', False)))
        
        new_result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        if new_result['requested_at']:
            new_result['requested_at'] = new_result['requested_at'].isoformat()
            
        return jsonify(dict(new_result)), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lab_results_bp.route('/api/lab-results/<int:result_id>/complete', methods=['PUT'])
def complete_lab_result(result_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            UPDATE lab_results 
            SET status = 'completed', completed_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
        """, (result_id,))
        
        updated_result = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        if not updated_result:
            return jsonify({"error": "Lab result not found"}), 404
            
        if updated_result['requested_at']:
            updated_result['requested_at'] = updated_result['requested_at'].isoformat()
        if updated_result['completed_at']:
            updated_result['completed_at'] = updated_result['completed_at'].isoformat()
            
        return jsonify(dict(updated_result)), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
