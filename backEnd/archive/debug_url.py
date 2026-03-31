from sqlalchemy.engine.url import make_url
import os

user = "postgres"
password = ""
host = "localhost"
port = "5432"
dbname = "bhcare"

url_str = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
print(f"URL String: {url_str}")

u = make_url(url_str)
print(f"Parsed Password: '{u.password}'")
print(f"Parsed Password Type: {type(u.password)}")

# Compare with missing password
url_str_none = f"postgresql://{user}@{host}:{port}/{dbname}"
print(f"URL String (No Pass): {url_str_none}")
u_none = make_url(url_str_none)
print(f"Parsed Password (No Pass): '{u_none.password}'")
