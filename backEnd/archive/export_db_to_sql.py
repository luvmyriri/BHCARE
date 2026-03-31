
import psycopg2
from psycopg2 import sql
from database import get_db_connection
from datetime import datetime, date, time

def get_create_statement(conn, table_name):
    cur = conn.cursor()
    
    # Get columns
    cur.execute(f"SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '{table_name}' ORDER BY ordinal_position")
    columns = cur.fetchall()
    
    col_defs = []
    for col in columns:
        name, dtype, nullable, default = col
        
        is_serial = False
        if default and 'nextval' in str(default):
            if dtype == 'integer':
                full_def = f"{name} SERIAL"
                is_serial = True
            elif dtype == 'bigint':
                full_def = f"{name} BIGSERIAL"
                is_serial = True
        
        if not is_serial:
            full_def = f"{name} {dtype}"
            if nullable == 'NO':
                full_def += " NOT NULL"
            if default:
                full_def += f" DEFAULT {default}"
        else:
             print(f"  [INFO] Column {name} converted to SERIAL")


        col_defs.append(full_def)
    
    # Get primary key
    cur.execute(f"""
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = '{table_name}' AND tc.constraint_type = 'PRIMARY KEY'
    """)
    pk = cur.fetchone()
    if pk:
        col_defs.append(f"PRIMARY KEY ({pk[0]})")
        
    create_stmt = f"CREATE TABLE IF NOT EXISTS {table_name} (\n    " + ",\n    ".join(col_defs) + "\n);"
    cur.close()
    return create_stmt

def escape_value(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (datetime, date, time)):
        return f"'{val}'"
    # Basic SQL scaling
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"

def dump_to_sql():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Determine table order based on likely FK constraints (simple heuristic: created order or list)
        # Assuming typical order: users first, then related tables
        tables = [
            'users', 
            'admin_users', 
            'services', 
            'schedule_slots', 
            'inventory', 
            'lab_results',
            'appointments',
            'soap_notes',
            'notifications',
            'visit_logs'
        ]
        
        with open('bhcare_full_dump.sql', 'w', encoding='utf-8') as f:
            f.write(f"-- BHCARE Database Dump\n")
            f.write(f"-- Generated on {datetime.now()}\n\n")
            
            # Check existing tables in DB to avoid errors if table list is outdated
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
            existing_tables = [row[0] for row in cur.fetchall()]
            
            valid_tables = [t for t in tables if t in existing_tables]
            
            for table in valid_tables:
                print(f"Exporting {table}...")
                f.write(f"\n-- Structure for table {table}\n")
                try:
                    create_stmt = get_create_statement(conn, table)
                    f.write(f"DROP TABLE IF EXISTS {table} CASCADE;\n")
                    f.write(create_stmt + "\n\n")
                    
                    f.write(f"-- Data for table {table}\n")
                    cur.execute(f"SELECT * FROM {table}")
                    rows = cur.fetchall()
                    
                    if rows:
                        colnames = [desc[0] for desc in cur.description]
                        for row in rows:
                            values = [escape_value(val) for val in row]
                            insert_stmt = f"INSERT INTO {table} ({', '.join(colnames)}) VALUES ({', '.join(values)});"
                            f.write(insert_stmt + "\n")
                    f.write("\n")
                except Exception as e:
                    f.write(f"-- Error exporting {table}: {e}\n")
                    print(f"❌ Error exporting {table}: {e}")

            print("✅ Database dump completed to bhcare_full_dump.sql")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Critical Error: {e}")

if __name__ == "__main__":
    dump_to_sql()
