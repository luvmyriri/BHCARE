from flask import Flask
from email_config import init_mail, send_password_reset_email
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
mail = init_mail(app)

print("Attempting to send test email...")
try:
    with app.app_context():
        # Using a dummy email or the user's email if recently found, but safe to use the sender itself for testing
        recipient = 'bhcarehealthcenter@gmail.com' 
        send_password_reset_email(mail, recipient, "123456")
    print("Email sent successfully!")
except Exception as e:
    print(f"FAILED to send email: {e}")
