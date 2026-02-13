import psycopg2
import os
import sys

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

DB_HOST = 'localhost'
DB_PORT = '5432'
DB_USER = 'postgres'

passwords_to_try = [
    '0428', # Current env
    'postgres',
    'admin',
    'root',
    'password',
    '123456',
    'admin123',
    ''  # Empty password
]

print(f"Testing passwords for user '{DB_USER}' on {DB_HOST}:{DB_PORT}...")

valid_password = None

for pwd in passwords_to_try:
    print(f"Testing password: '{pwd}' ... ", end='')
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=pwd,
            dbname='postgres',
            connect_timeout=3
        )
        print("SUCCESS! ✅")
        valid_password = pwd
        conn.close()
        break
    except Exception as e:
        print("Failed.")

if valid_password is not None:
    print(f"\nFOUND VALID PASSWORD: '{valid_password}'")
    # Write to a file so we can read it
    with open("valid_password.txt", "w") as f:
        f.write(valid_password)
else:
    print("\nNo valid password found in common list.")
