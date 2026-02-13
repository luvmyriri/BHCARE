-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule slots table
CREATE TABLE IF NOT EXISTS schedule_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_appointments INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default services
INSERT INTO services (name, description, duration_minutes) VALUES
    ('General Consultation', 'Regular health check-up and consultation with our healthcare providers', 30),
    ('Prenatal Care', 'Comprehensive prenatal care for expecting mothers', 45),
    ('Immunization', 'Vaccination services for children and adults', 20),
    ('Family Planning', 'Family planning counseling and services', 30),
    ('Dental Check-up', 'Routine dental examination and cleaning', 30),
    ('Laboratory Tests', 'Blood tests, urinalysis, and other laboratory services', 15)
ON CONFLICT (name) DO NOTHING;

-- Insert default schedule slots (Monday to Friday, 8 AM to 5 PM)
INSERT INTO schedule_slots (day_of_week, start_time, end_time, max_appointments) VALUES
    -- Monday
    (0, '08:00:00', '12:00:00', 8),
    (0, '13:00:00', '17:00:00', 8),
    -- Tuesday
    (1, '08:00:00', '12:00:00', 8),
    (1, '13:00:00', '17:00:00', 8),
    -- Wednesday
    (2, '08:00:00', '12:00:00', 8),
    (2, '13:00:00', '17:00:00', 8),
    -- Thursday
    (3, '08:00:00', '12:00:00', 8),
    (3, '13:00:00', '17:00:00', 8),
    -- Friday
    (4, '08:00:00', '12:00:00', 8),
    (4, '13:00:00', '17:00:00', 8)
ON CONFLICT DO NOTHING;
