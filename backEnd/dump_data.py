import json
from datetime import date, datetime, time
from database import get_db_connection

def json_serial(obj):
    if isinstance(obj, (datetime, date, time)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def dump_data():
    conn = get_db_connection()
    cur = conn.cursor()
    
    tables = ['users', 'admin_users', 'services', 'schedule_slots', 'inventory', 'lab_results']
    data = {}
    
    for table in tables:
        try:
            cur.execute(f"SELECT * FROM {table} LIMIT 0")
            colnames = [desc[0] for desc in cur.description]
            
            cur.execute(f"SELECT * FROM {table}")
            rows = cur.fetchall()
            
            table_data = []
            for row in rows:
                table_data.append(dict(zip(colnames, row)))
            data[table] = table_data
            print(f"✅ Dumped {len(rows)} rows from {table}")
        except Exception as e:
            print(f"❌ Could not dump {table}: {e}")
            
    with open('db_dump.json', 'w') as f:
        json.dump(data, f, default=json_serial, indent=2)
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    dump_data()
