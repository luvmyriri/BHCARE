# pyre-ignore-all-errors
import time
import psycopg2.extras # type: ignore
from threading import Thread
from datetime import datetime, timedelta
from database import get_db_connection # type: ignore
from email_config import send_appointment_reminder_email # type: ignore

def check_reminders(app, mail):
    """
    Background worker that checks for upcoming appointments 
    and sends email reminders. Runs every hour.
    """
    with app.app_context():
        print("[ReminderService] Background worker started.")
        while True:
            try:
                # Find all appointments for tomorrow that haven't been notified yet
                tomorrow = (datetime.now() + timedelta(days=1)).date()
                
                conn = get_db_connection()
                cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
                
                # Check for "near" appointments (tomorrow)
                # Filter by status = 'confirmed' or 'pending'
                cursor.execute("""
                    SELECT a.id, a.appointment_date, a.appointment_time, a.service_type, u.first_name, u.email
                    FROM appointments a
                    JOIN users u ON a.user_id = u.id
                    WHERE a.appointment_date = %s
                      AND a.reminder_sent = FALSE
                      AND a.status NOT IN ('cancelled', 'completed')
                """, (tomorrow,))
                
                to_remind = cursor.fetchall()
                
                if to_remind:
                    print(f"[ReminderService] Found {len(to_remind)} appointments for tomorrow.")
                
                for apt in to_remind:
                    try:
                        # Format date and time for better display
                        display_date = apt['appointment_date'].strftime('%B %d, %Y')
                        
                        raw_time = apt['appointment_time']
                        # Handle both string and time objects
                        if isinstance(raw_time, str):
                            try:
                                # try HH:MM or HH:MM:SS
                                t = datetime.strptime(raw_time, '%H:%M:%S').time()
                                display_time = t.strftime('%I:%M %p')
                            except:
                                try:
                                    t = datetime.strptime(raw_time, '%H:%M').time()
                                    display_time = t.strftime('%I:%M %p')
                                except:
                                    display_time = raw_time
                        else:
                            display_time = raw_time.strftime('%I:%M %p')

                        if apt['email']:
                            send_appointment_reminder_email(
                                mail, 
                                apt['email'], 
                                apt['first_name'], 
                                display_date, 
                                display_time, 
                                apt['service_type']
                            )
                            
                            # Mark as sent
                            cursor.execute("UPDATE appointments SET reminder_sent = TRUE WHERE id = %s", (apt['id'],))
                            conn.commit()
                            print(f"[ReminderService] Reminder sent to {apt['email']} for appointment #{apt['id']}")
                    
                    except Exception as e:
                        print(f"[ReminderService] Error sending to {apt['email'] or 'unknown'}: {e}")
                
                cursor.close()
                conn.close()
            
            except Exception as e:
                print(f"[ReminderService] Loop error: {e}")
            
            # Wait 1 hour (3600 seconds) before checking again
            time.sleep(3600)

def start_reminder_service(app, mail):
    """Initializes and starts the reminder background thread"""
    thread = Thread(target=check_reminders, args=(app, mail))
    thread.daemon = True
    thread.start()
    return thread
