import psycopg2
conn = psycopg2.connect('dbname=bhcare user=postgres password=ADMIN123 host=localhost')
cur = conn.cursor()
cur.execute('SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema=\'public\' ORDER BY table_name, ordinal_position')
rows = cur.fetchall()
with open('c:\\xampp\\htdocs\\BHCARE\\backend\\schema.log', 'w', encoding='utf-8') as f:
    for r in rows:
        f.write(f'{r[0]}.{r[1]} ({r[2]})\n')
