import psycopg2
import os
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
import json
import datetime

load_dotenv()

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'bhcare'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD')
    )
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("SELECT id, first_name, last_name, email, EXTRACT(YEAR FROM age(date_of_birth)) as age, house_number, street_name, barangay, city, province FROM users WHERE id = 1")
    user = cur.fetchone()
    
    with open('user_info.txt', 'w') as f:
        if user:
            f.write(f"--- User {user['id']} Summary ---\n")
            f.write(f"Name: {user['first_name']} {user['last_name']}\n")
            f.write(f"Email: {user['email']}\n")
            f.write(f"Age: {int(user['age']) if user['age'] else 'N/A'}\n")
            f.write("Address:\n")
            f.write(f"  House: '{user['house_number']}'\n")
            f.write(f"  Street: '{user['street_name']}'\n")
            f.write(f"  Barangay: '{user['barangay']}'\n")
            f.write(f"  City: '{user['city']}'\n")
            f.write(f"  Province: '{user['province']}'\n")
            f.write("---------------------------\n")
            print("Successfully wrote to user_info.txt")
        else:
            f.write("User 1 not found\n")
            print("User 1 not found")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
