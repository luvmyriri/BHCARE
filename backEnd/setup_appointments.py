"""
Database setup script to create appointment-related tables
"""
from database import get_db_connection

def setup_appointment_tables():
    """Create services and schedule_slots tables with default data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Create services table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                duration_minutes INTEGER DEFAULT 30,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Services table created")
        
        # Create schedule_slots table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schedule_slots (
                id SERIAL PRIMARY KEY,
                day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                max_appointments INTEGER DEFAULT 5,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Schedule slots table created")
        
        # Insert default services
        services = [
            ('General Consultation', 'Regular health check-up and consultation with our healthcare providers', 30),
            ('Prenatal Care', 'Comprehensive prenatal care for expecting mothers', 45),
            ('Immunization', 'Vaccination services for children and adults', 20),
            ('Family Planning', 'Family planning counseling and services', 30),
            ('Dental Check-up', 'Routine dental examination and cleaning', 30),
            ('Laboratory Tests', 'Blood tests, urinalysis, and other laboratory services', 15)
        ]
        
        for name, description, duration in services:
            cursor.execute("""
                INSERT INTO services (name, description, duration_minutes)
                VALUES (%s, %s, %s)
                ON CONFLICT (name) DO NOTHING
            """, (name, description, duration))
        print(f"✅ Inserted {len(services)} default services")
        
        # Insert default schedule slots (Monday to Friday, 8 AM to 5 PM)
        schedule_slots = [
            # Monday
            (0, '08:00:00', '12:00:00', 8),
            (0, '13:00:00', '17:00:00', 8),
            # Tuesday
            (1, '08:00:00', '12:00:00', 8),
            (1, '13:00:00', '17:00:00', 8),
            # Wednesday
            (2, '08:00:00', '12:00:00', 8),
            (2, '13:00:00', '17:00:00', 8),
            # Thursday
            (3, '08:00:00', '12:00:00', 8),
            (3, '13:00:00', '17:00:00', 8),
            # Friday
            (4, '08:00:00', '12:00:00', 8),
            (4, '13:00:00', '17:00:00', 8)
        ]
        
        for day, start, end, max_appts in schedule_slots:
            cursor.execute("""
                INSERT INTO schedule_slots (day_of_week, start_time, end_time, max_appointments)
                VALUES (%s, %s, %s, %s)
            """, (day, start, end, max_appts))
        print(f"✅ Inserted {len(schedule_slots)} schedule slots")
        
        conn.commit()
        print("\n✅ All appointment tables created successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    setup_appointment_tables()
