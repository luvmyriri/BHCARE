# pyre-ignore-all-errors
"""
Email configuration and utility functions for sending emails via Gmail SMTP
"""
from flask_mail import Mail, Message  # type: ignore
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

# Public URL for logo used in all outbound emails
LOGO_URL = "http://localhost:3000/images/Logo.png"

from collections import defaultdict
from typing import Dict, Any

# In-memory storage for reset codes: email -> {code, expires}
reset_codes: Dict[str, Dict[str, Any]] = {}

# In-memory rate limiting for forgot-password: email -> { last_requested_at, attempt_count }
forgot_rate_limits: Dict[str, Dict[str, Any]] = defaultdict(dict)

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
        del reset_codes[email] # type: ignore
        return None
    
    return email

def invalidate_reset_token(token, email=None):
    """Remove token after use"""
    if email and email in reset_codes:
        del reset_codes[email] # type: ignore


def check_forgot_cooldown(email: str, cooldown_seconds: int = 60, max_per_hour: int = 5):
    """
    Simple in-memory cooldown for forgot-password.

    Returns:
        (allowed: bool, retry_after: int | None, message: str | None)
    """
    now = datetime.now()
    info = forgot_rate_limits.get(email, {})

    last = info.get("last_requested_at") # type: ignore
    count = info.get("count", 0) # type: ignore

    # Per-minute style cooldown between requests
    if last is not None:
        delta = (now - last).total_seconds() # type: ignore
        if delta < cooldown_seconds:
            retry_after = int(cooldown_seconds - delta)
            msg = f"Too many attempts. Please wait {retry_after} seconds before requesting another code."
            return False, retry_after, msg

        # Reset count if we're past an hour window
        if delta > 3600:
            count = 0

    # Basic hourly cap
    if count >= max_per_hour: # type: ignore
        msg = "You have requested too many codes. Please try again later."
        return False, cooldown_seconds, msg

    # Update tracking and allow request
    forgot_rate_limits[email] = { # type: ignore
        "last_requested_at": now,
        "count": count + 1, # type: ignore
    }
    return True, None, None

def send_password_reset_email(mail, recipient_email, reset_token):
    """Send password reset email with 6-digit code"""
    
    msg = Message(
        subject="BHCare - Password Reset Code",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
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


def send_registration_success_email(mail, recipient_email, first_name):
    """Send a welcome confirmation email upon successful registration"""
    
    msg = Message(
        subject="Welcome to BHCare Health Center!",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Registration Successful</h2>
                    
                    <p>Hello <strong>{first_name}</strong>,</p>
                    
                    <p>Welcome to BHCare! Your patient account has been successfully created. You can now log into the portal to access your medical records, book appointments, and engage with our health services directly.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173" style="display: inline-block; padding: 12px 24px; background: #38b2ac; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Access Your Portal</a>
                    </div>
                    
                    <p>If you have any questions or require immediate medical assistance, please do not hesitate to contact or visit the health center.</p>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)

def send_staff_creation_email(mail, recipient_email, first_name, role, temporary_password):
    """Send an email with the auto-generated temporary password to new medical staff/doctors"""
    
    msg = Message(
        subject="Welcome to BHCare - Your Staff Account Credentials",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Account Created Successfully</h2>
                    
                    <p>Hello <strong>{first_name}</strong>,</p>
                    
                    <p>An administrator has created a <strong>{role}</strong> account for you. Welcome to the team!</p>
                    
                    <p>Please use the following temporary password to log into your account:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 30px; background: #f0f4f8; color: #2c5282; border: 2px solid #38b2ac; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 2px;">{temporary_password}</span>
                    </div>
                    
                    <p style="text-align: center; color: #d69e2e; font-size: 14px;"><strong>We strongly recommend changing your password immediately after logging in.</strong></p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173" style="display: inline-block; padding: 12px 24px; background: #38b2ac; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Access the Portal</a>
                    </div>
                    
                    <p>When logging in, make sure to select the <strong>Medical Staff</strong> portal.</p>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)

def send_walkin_patient_credentials_email(mail, recipient_email, first_name, temporary_password):
    """Send an email with the auto-generated temporary password to a new walk-in patient"""
    
    msg = Message(
        subject="Welcome to BHCare - Your Patient Portal Credentials",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Patient Account Created</h2>
                    
                    <p>Hello <strong>{first_name}</strong>,</p>
                    
                    <p>Your walk-in registration at the clinic was successful! We have also created a patient portal account for you so you can access your medical records and book future appointments online.</p>
                    
                    <p>Please use this temporary password to log into your account for the first time:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 30px; background: #f0f4f8; color: #2c5282; border: 2px solid #38b2ac; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 2px;">{temporary_password}</span>
                    </div>
                    
                    <p style="text-align: center; color: #d69e2e; font-size: 14px;"><strong>You will be prompted to change your password upon your first login.</strong></p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173" style="display: inline-block; padding: 12px 24px; background: #38b2ac; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Access the Portal</a>
                    </div>
                    
                    <p>When logging in, make sure you are on the Patient portal.</p>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)


def send_document_ready_email(mail, recipient_email, first_name, document_type):
    """Send an email notifying the patient that their requested document is ready"""
    
    msg = Message(
        subject=f"Your {document_type} is Ready for Pickup",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Document Ready for Pickup</h2>
                    
                    <p>Hello <strong>{first_name}</strong>,</p>
                    
                    <p>We are pleased to inform you that your requested <strong>{document_type}</strong> has been processed and is now ready.</p>
                    
                    <div style="margin: 20px 0; padding: 15px; background: #e6fffa; border-left: 4px solid #319795; color: #234e52;">
                        <p style="margin: 0;"><strong>Next Step:</strong> You may now visit the Barangay 174 Health Center during our regular clinical hours to claim your document.</p>
                    </div>
                    
                    <p>Please remember to bring a valid ID when picking up your document.</p>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)


def send_ticket_confirmation_email(mail, recipient_email, name, subject, ticket_id):
    """Send a confirmation email to someone who just submitted a contact ticket"""

    msg = Message(
        subject=f"We received your message – BHCare Health Center",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>

                    <h2 style="color: #2c5282; text-align: center;">Message Received!</h2>

                    <p>Hello <strong>{name}</strong>,</p>

                    <p>Thank you for reaching out to us. We have received your message and our team will review it shortly.</p>

                    <div style="margin: 20px 0; padding: 15px; background: #e6fffa; border-left: 4px solid #319795; color: #234e52;">
                        <p style="margin: 0;"><strong>Subject:</strong> {subject}</p>
                    </div>

                    <p>We aim to respond within 1–2 business days. If your concern is urgent, please visit the health center directly during clinic hours.</p>

                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )

    mail.send(msg)


def send_ticket_resolved_email(mail, recipient_email, name, subject, ticket_id):
    """Send an email to notify the submitter that their ticket has been resolved"""

    msg = Message(
        subject=f"Your inquiry has been resolved – BHCare Health Center",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>

                    <h2 style="color: #2c5282; text-align: center;">Ticket Resolved ✅</h2>

                    <p>Hello <strong>{name}</strong>,</p>

                    <p>We are writing to let you know that your inquiry has been reviewed and resolved by our team.</p>

                    <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #38a169; color: #1a4731;">
                        <p style="margin: 0;"><strong>Subject:</strong> {subject}</p>
                        <p style="margin: 8px 0 0;"><strong>Status:</strong> Resolved</p>
                    </div>

                    <p>If you have follow-up questions or the issue persists, please do not hesitate to contact us again through our website or visit the health center in person.</p>

                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )

    mail.send(msg)


def send_appointment_confirmation_email(mail, recipient_email, first_name, date, time, service):
    """Send an appointment confirmation email"""
    
    msg = Message(
        subject="Appointment Confirmed - BHCare Health Center",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Appointment Confirmed! ✅</h2>
                    
                    <p>Hello <strong>{first_name}</strong>,</p>
                    
                    <p>Your appointment has been successfully scheduled. We look forward to seeing you!</p>
                    
                    <div style="margin: 20px 0; padding: 20px; background: #f0f4f8; border-radius: 8px; border-left: 5px solid #38b2ac;">
                        <p style="margin: 5px 0;"><strong>📅 Date:</strong> {date}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Time:</strong> {time}</p>
                        <p style="margin: 5px 0;"><strong>🏥 Service:</strong> {service}</p>
                    </div>
                    
                    <p><strong>Reminders:</strong></p>
                    <ul>
                        <li>Please arrive 15 minutes before your scheduled time.</li>
                        <li>Bring your Barangay ID or any valid identification.</li>
                        <li>If you need to reschedule, please do so through the portal at least 24 hours in advance.</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/appointments" style="display: inline-block; padding: 12px 24px; background: #38b2ac; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">View My Appointments</a>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)

def send_appointment_reminder_email(mail, recipient_email, first_name, date, time, service):
    """Send an appointment reminder email"""
    
    msg = Message(
        subject="Reminder: Upcoming Appointment - BHCare Health Center",
        recipients=[recipient_email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="{LOGO_URL}" alt="BHCare Logo" style="height: 64px; margin-bottom: 8px;" />
                        <h1 style="color: #38b2ac; margin: 0;">BHCare Health Center</h1>
                        <p style="color: #666; margin: 5px 0;">Barangay 174 Health Portal</p>
                    </div>
                    
                    <h2 style="color: #2c5282; text-align: center;">Appointment Reminder 🔔</h2>
                    
                    <p>Hello <strong>{first_name}</strong>,</p>
                    
                    <p>This is a friendly reminder that you have an upcoming appointment scheduled at our health center.</p>
                    
                    <div style="margin: 20px 0; padding: 20px; background: #fffaf0; border-radius: 8px; border-left: 5px solid #ed8936;">
                        <p style="margin: 5px 0;"><strong>📅 Date:</strong> {date}</p>
                        <p style="margin: 5px 0;"><strong>⏰ Time:</strong> {time}</p>
                        <p style="margin: 5px 0;"><strong>🏥 Service:</strong> {service}</p>
                    </div>
                    
                    <p>If you cannot make it, please cancel or reschedule as soon as possible so we can offer the slot to other patients.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/appointments" style="display: inline-block; padding: 12px 24px; background: #38b2ac; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">View Portal</a>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© 2026 BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)

def send_admin_creation_email(mail, email, first_name, temp_password):
    """Send welcome email with temporary credentials to a new Admin."""
    msg = Message(
        subject="Welcome to BHCare - Administrative Access",
        recipients=[email],
        html=f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-top: 5px solid #38b2ac;">
                    <br><h2 style="color: #2c7a7b; margin-bottom: 24px; font-size: 24px;">Welcome to BHCare Admin Portal</h2>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Hello <strong>{first_name}</strong>,</p>
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Your <strong>Administrator</strong> account has been successfully created. You can now access the system with complete oversight privileges.</p>
                    
                    <div style="background: #edf2f7; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #319795;">
                        <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 14px; text-transform: uppercase; font-weight: bold;">Your Login Credentials</p>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li style="margin-bottom: 8px;"><strong style="color: #2d3748;">Email:</strong> {email}</li>
                            <li><strong style="color: #2d3748;">Temporary Password:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; color: #e53e3e; font-size: 16px; font-weight: bold;">{temp_password}</code></li>
                        </ul>
                    </div>

                    <p style="color: #e53e3e; font-size: 15px; font-weight: bold; margin-bottom: 30px;">
                        ⚠️ Security Notice: You will be required to change your password immediately upon your first login.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/admin" style="display: inline-block; padding: 12px 24px; background: #38b2ac; color: white; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">Access Admin Dashboard</a>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                        <p>© {datetime.now().year} BHCare Health Center - Barangay 174, Caloocan City</p>
                    </div>
                </div>
            </body>
        </html>
        """
    )
    
    mail.send(msg)
