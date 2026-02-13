import psycopg2
import sys

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

hosts = ['localhost', '127.0.0.1', '::1']
db = 'postgres'
user = 'postgres'
password = ''

results = []

for host in hosts:
    print(f"Testing {host}...")
    try:
        conn = psycopg2.connect(
            host=host,
            user=user,
            password=password,
            dbname=db,
            connect_timeout=3
        )
        print(f"✅ SUCCESS: {host}")
        results.append(f"SUCCESS: {host}")
        conn.close()
    except Exception as e:
        print(f"❌ FAIL: {host} - {e}")
        results.append(f"FAIL: {host} - {e}")

with open("definitive_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(results))
