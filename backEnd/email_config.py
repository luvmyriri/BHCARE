"""
Email configuration and utility functions for sending emails via Gmail SMTP
"""
from flask_mail import Mail, Message
import secrets
from datetime import datetime, timedelta

# Email configuration
MAIL_CONFIG = {
    'MAIL_SERVER': 'smtp.gmail.com',
    'MAIL_PORT': 587,
    'MAIL_USE_TLS': True,
    'MAIL_USERNAME': 'bhcarehealthcenter@gmail.com',
    'MAIL_PASSWORD': 'omeo hvvj lykd buxc',  # App password
    'MAIL_DEFAULT_SENDER': 'bhcarehealthcenter@gmail.com'
}

# In-memory storage for reset codes: email -> {code, expires}
reset_codes = {}

def init_mail(app):
    """Initialize Flask-Mail with the app"""
    app.config.update(MAIL_CONFIG)
    mail = Mail(app)
    return mail

def generate_reset_token():
    """Generate a 6-digit verification code"""
    import random
    return str(random.randint(100000, 999999))

def store_reset_token(email, token):
    """Store reset code for email with expiration (10 minutes)"""
    expiration = datetime.now() + timedelta(minutes=10)
    reset_codes[email] = {
        'code': token,
        'expires': expiration
    }
    return token

def validate_reset_token(token, email=None):
    """
    Validate reset code for a specific email.
    Note: 'token' argument name kept for compatibility, but it represents the 6-digit code.
    Authentication requires both email and code.
    """
    if not email:
        return None
        
    if email not in reset_codes:
        return None
    
    data = reset_codes[email]
    
    if data['code'] != token:
        return None
        
    if datetime.now() > data['expires']:
        del reset_codes[email]
        return None
    
    return email

def invalidate_reset_token(token, email=None):
    """Remove token after use"""
    if email and email in reset_codes:
        del reset_codes[email]

def send_password_reset_email(mail, recipient_email, reset_token):
    """Send password reset email with 6-digit code"""
    
    msg = Message(
        subject="BHCare - Password Reset Code",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Verify Your Identity</h2>
                    
                    <p>Hello,</p>
                    
                    <p>We received a request to reset your password. Please use the following code to complete the process:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 30px; background: #f0f4f8; color: #2c5282; border: 2px solid #38b2ac; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 5px;">{reset_token}</span>
                    </div>
                    
                    <p style="text-align: center; color: #666;">This code will expire in 10 minutes.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
                        <p><strong>⚠️ Important:</strong></p>
                        <ul>
                            <li>Do not share this code with anyone.</li>
                            <li>If you didn't request this reset, please ignore this email.</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)

