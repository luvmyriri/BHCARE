from flask import Blueprint, jsonify, request
from database import get_db_connection
import psycopg2.extras
from datetime import datetime

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/api/inventory', methods=['GET'])
def get_inventory():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("SELECT * FROM inventory ORDER BY item_name")
        items = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        for item in items:
             if item['expiry_date']:
                item['expiry_date'] = item['expiry_date'].isoformat()
             if item['updated_at']:
                item['updated_at'] = item['updated_at'].isoformat()
                
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/api/inventory', methods=['POST'])
def add_inventory_item():
    try:
        data = request.get_json()
        required = ['item_name', 'category', 'stock_quantity', 'unit']
        for field in required:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400
                
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            INSERT INTO inventory (item_name, category, stock_quantity, unit, status, expiry_date)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (data['item_name'], data['category'], data['stock_quantity'], 
              data['unit'], data.get('status', 'Good'), data.get('expiry_date')))
        
        new_item = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()
        
        if new_item['expiry_date']:
            new_item['expiry_date'] = new_item['expiry_date'].isoformat()
        if new_item['updated_at']:
            new_item['updated_at'] = new_item['updated_at'].isoformat()
            
        return jsonify(dict(new_item)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
