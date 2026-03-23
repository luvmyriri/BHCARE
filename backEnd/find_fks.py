from app import get_db_connection

def find_fks():
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = """
    SELECT
        tc.table_name as dependent_table,
        kcu.column_name as foreign_key_column
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
    """
    
    cur.execute(query)
    results = cur.fetchall()
    
    with open('fks_output.txt', 'w', encoding='utf-8') as f:
        f.write("TABLES REFERENCING 'users':\n")
        for row in results:
            f.write(f"Table: {row[0]}, Column: {row[1]}\n")
        
    cur.close()
    conn.close()

if __name__ == '__main__':
    find_fks()
