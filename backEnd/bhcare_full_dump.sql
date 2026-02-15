-- BHCARE Database Dump
-- Generated on 2026-02-13 23:37:16.482807


-- Structure for table users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    first_name character varying NOT NULL,
    middle_name character varying,
    last_name character varying NOT NULL,
    date_of_birth date NOT NULL,
    gender character varying NOT NULL,
    contact_number character varying NOT NULL,
    barangay character varying NOT NULL,
    city character varying NOT NULL,
    province character varying NOT NULL,
    house_number character varying,
    block_number character varying,
    lot_number character varying,
    street_name character varying,
    subdivision character varying,
    zip_code character varying,
    full_address text,
    id_image_path character varying,
    id_image bytea,
    ocr_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    philhealth_id character varying,
    PRIMARY KEY (id)
);

-- Data for table users
INSERT INTO users (id, email, password_hash, first_name, middle_name, last_name, date_of_birth, gender, contact_number, barangay, city, province, house_number, block_number, lot_number, street_name, subdivision, zip_code, full_address, id_image_path, id_image, ocr_text, created_at, philhealth_id) VALUES (1, 'juan.delacruz@example.com', 'hashed_password', 'Juan', NULL, 'Dela Cruz', '1980-01-01', 'Male', '09171234567', '174', 'Caloocan', 'Metro Manila', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 23:37:48.750791', NULL);
INSERT INTO users (id, email, password_hash, first_name, middle_name, last_name, date_of_birth, gender, contact_number, barangay, city, province, house_number, block_number, lot_number, street_name, subdivision, zip_code, full_address, id_image_path, id_image, ocr_text, created_at, philhealth_id) VALUES (2, 'genetabios13@gmail.com', '$2b$12$lvaUwbGKldJPJ1QLoOB44.AMHPYzxRDlzx49mrU5OF6kbR4r5fDZq', 'Gene', 'Gange', 'Tabios', '2005-06-13', 'Male', '+639614331761', 'Barangay 171', 'Caloocan City', 'Metro Manila', '', 'Block 9', 'Lot 30', 'Ruby', 'Ruby St Celina', '1421', 'BLK 9 LOT 30, RUBY ST CELINA HOMES 3 BAGUMBONG, BARANGAY 171, CALOOCAN CITY, NCR, THIRD DISTRICT, 1421 License No.', NULL, NULL, NULL, '2026-02-12 23:37:48.750791', NULL);
INSERT INTO users (id, email, password_hash, first_name, middle_name, last_name, date_of_birth, gender, contact_number, barangay, city, province, house_number, block_number, lot_number, street_name, subdivision, zip_code, full_address, id_image_path, id_image, ocr_text, created_at, philhealth_id) VALUES (3, 'security1741@bhcare.ph', '$2b$12$5k1sh0AV77o0hQdpSgSTb.xk9VkT3SEKDbLyIHNJHChaFAt4r1LVi', 'Security', NULL, 'Department', '1990-01-01', 'N/A', '+639000000000', '174', 'Caloocan', 'Metro Manila', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 23:37:48.750791', NULL);


-- Structure for table admin_users
DROP TABLE IF EXISTS admin_users CASCADE;
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL,
    username character varying NOT NULL,
    password_hash character varying NOT NULL,
    email character varying,
    role character varying NOT NULL DEFAULT 'admin'::character varying,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    PRIMARY KEY (id)
);

-- Data for table admin_users
INSERT INTO admin_users (id, username, password_hash, email, role, is_active, created_at, last_login) VALUES (1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTvQiOe', 'admin@bhcare.local', 'admin', True, '2026-02-12 23:37:48.750791', NULL);


-- Structure for table services
DROP TABLE IF EXISTS services CASCADE;
CREATE TABLE IF NOT EXISTS services (
    id SERIAL,
    name character varying NOT NULL,
    description text,
    duration_minutes integer NOT NULL DEFAULT 30,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Data for table services
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (1, 'General Consultation', 'General health check-up and consultation', 30, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (2, 'Prenatal Care', 'Prenatal check-up for pregnant women', 45, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (3, 'Immunization', 'Vaccination and immunization services', 20, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (4, 'Family Planning', 'Family planning consultation and services', 30, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (5, 'Dental Care', 'Basic dental check-up and treatment', 40, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (6, 'Laboratory Services', 'Blood tests and other laboratory services', 30, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (7, 'TB DOTS', 'Tuberculosis treatment and monitoring', 30, True, '2026-02-12 23:37:48.750791');
INSERT INTO services (id, name, description, duration_minutes, is_active, created_at) VALUES (8, 'Nutrition Counseling', 'Nutritional assessment and counseling', 30, True, '2026-02-12 23:37:48.750791');


-- Structure for table schedule_slots
DROP TABLE IF EXISTS schedule_slots CASCADE;
CREATE TABLE IF NOT EXISTS schedule_slots (
    id SERIAL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    max_appointments integer NOT NULL DEFAULT 5,
    is_active boolean NOT NULL DEFAULT true,
    PRIMARY KEY (id)
);

-- Data for table schedule_slots
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (1, 0, '08:00:00', '12:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (2, 0, '13:00:00', '17:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (3, 1, '08:00:00', '12:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (4, 1, '13:00:00', '17:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (5, 2, '08:00:00', '12:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (6, 2, '13:00:00', '17:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (7, 3, '08:00:00', '12:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (8, 3, '13:00:00', '17:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (9, 4, '08:00:00', '12:00:00', 5, True);
INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES (10, 4, '13:00:00', '17:00:00', 5, True);


-- Structure for table inventory
DROP TABLE IF EXISTS inventory CASCADE;
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL,
    item_name character varying NOT NULL,
    category character varying NOT NULL,
    stock_quantity integer NOT NULL DEFAULT 0,
    unit character varying NOT NULL,
    status character varying,
    expiry_date date,
    updated_at timestamp without time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Data for table inventory
INSERT INTO inventory (id, item_name, category, stock_quantity, unit, status, expiry_date, updated_at) VALUES (1, 'Paracetamol 500mg', 'Medicine', 500, 'boxes', 'Good', '2026-12-31', '2026-02-12 23:37:49.039242');
INSERT INTO inventory (id, item_name, category, stock_quantity, unit, status, expiry_date, updated_at) VALUES (2, 'Amoxicillin 500mg', 'Medicine', 50, 'pcs', 'Low Stock', '2025-10-15', '2026-02-12 23:37:49.039242');
INSERT INTO inventory (id, item_name, category, stock_quantity, unit, status, expiry_date, updated_at) VALUES (3, 'Medical Alcohol 70%', 'Supplies', 150, 'bottles', 'Good', '2027-05-20', '2026-02-12 23:37:49.039242');


-- Structure for table lab_results
DROP TABLE IF EXISTS lab_results CASCADE;
CREATE TABLE IF NOT EXISTS lab_results (
    id SERIAL,
    medical_record_id integer,
    patient_id integer NOT NULL,
    test_type character varying NOT NULL,
    result_summary text,
    status character varying DEFAULT 'pending'::character varying,
    is_urgent boolean DEFAULT false,
    requested_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone,
    PRIMARY KEY (id)
);

-- Data for table lab_results
INSERT INTO lab_results (id, medical_record_id, patient_id, test_type, result_summary, status, is_urgent, requested_at, completed_at) VALUES (1, NULL, 1, 'Complete Blood Count (CBC)', NULL, 'pending', False, '2026-02-12 23:37:49.051638', NULL);
INSERT INTO lab_results (id, medical_record_id, patient_id, test_type, result_summary, status, is_urgent, requested_at, completed_at) VALUES (2, NULL, 1, 'Urinalysis', NULL, 'processing', False, '2026-02-12 23:37:49.051638', NULL);
INSERT INTO lab_results (id, medical_record_id, patient_id, test_type, result_summary, status, is_urgent, requested_at, completed_at) VALUES (3, NULL, 1, 'X-Ray (Chest)', NULL, 'pending', True, '2026-02-12 23:37:49.051638', NULL);


-- Structure for table appointments
DROP TABLE IF EXISTS appointments CASCADE;
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL,
    user_id integer,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    service_type character varying NOT NULL,
    doctor_preference character varying,
    reason text,
    status character varying NOT NULL DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    queue_number integer,
    PRIMARY KEY (id)
);

-- Data for table appointments


-- Structure for table soap_notes
DROP TABLE IF EXISTS soap_notes CASCADE;
CREATE TABLE IF NOT EXISTS soap_notes (
    id SERIAL,
    patient_id integer NOT NULL,
    doctor_id integer,
    subjective text,
    objective text,
    assessment text,
    plan text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Data for table soap_notes


-- Structure for table notifications
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL,
    user_id integer NOT NULL,
    type character varying NOT NULL,
    message text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    related_id integer,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Data for table notifications


-- Structure for table visit_logs
DROP TABLE IF EXISTS visit_logs CASCADE;
CREATE TABLE IF NOT EXISTS visit_logs (
    id SERIAL,
    user_id integer,
    visitor_name character varying NOT NULL,
    purpose character varying NOT NULL,
    type character varying NOT NULL,
    timestamp timestamp without time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Data for table visit_logs

