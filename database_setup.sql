-- Campus Connect Database Setup Script
-- Run this in phpMyAdmin or MySQL command line

-- Create database
CREATE DATABASE IF NOT EXISTS campus_connect;
USE campus_connect;

-- Table: blocks (Academic Blocks)
CREATE TABLE IF NOT EXISTS blocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_path VARCHAR(255)
);

-- Table: floors (Floors in each block)
CREATE TABLE IF NOT EXISTS floors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    block_id INT NOT NULL,
    floor_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
);

-- Table: faculties (Faculty members)
CREATE TABLE IF NOT EXISTS faculties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    room VARCHAR(50),
    photo VARCHAR(255),
    block_id INT NOT NULL,
    floor_id INT NOT NULL,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Table: rooms (Classrooms, Labs, etc.)
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50),
    details TEXT,
    block_id INT NOT NULL,
    floor_id INT NOT NULL,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Table: users (For login functionality)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert sample blocks (matching your HTML)
INSERT INTO blocks (id, name, description) VALUES
(1, 'CV RAMAN', 'Advanced electrical engineering facility with power systems labs and electronics workshops.'),
(2, 'RAMANUJAN', 'One of the oldest building in the campus, contains the library'),
(3, 'VISVESVARAYA', 'State-of-the-art facility for Computer Science with modern labs and technology infrastructure.'),
(4, 'APJ ABDUL KALAM', 'Main administrative building housing principal''s office, admissions, and student services.'),
(5, 'ATAL INCUBATION CENTER', 'Administrative building housing incubation centers and industrial application labs.');

-- Insert sample floors (example for CV RAMAN block)
INSERT INTO floors (block_id, floor_name) VALUES
(1, 'Ground Floor'),
(1, 'First Floor'),
(1, 'Second Floor'),
(2, 'Ground Floor'),
(2, 'First Floor'),
(3, 'Ground Floor'),
(3, 'First Floor'),
(3, 'Second Floor'),
(4, 'Ground Floor'),
(4, 'First Floor'),
(5, 'Ground Floor'),
(5, 'First Floor');

-- Insert sample faculty (example data - replace with your actual data)
INSERT INTO faculties (name, role, email, phone, room, photo, block_id, floor_id) VALUES
('Dr. John Smith', 'Professor', 'john.smith@nmamit.in', '1234567890', '101', 'faculty/principal.jpg', 1, 1),
('Dr. Jane Doe', 'Associate Professor', 'jane.doe@nmamit.in', '1234567891', '102', NULL, 1, 1),
('Dr. Robert Johnson', 'Assistant Professor', 'robert.j@nmamit.in', '1234567892', '201', NULL, 1, 2);

-- Insert sample rooms (example data - replace with your actual data)
INSERT INTO rooms (name, room_number, details, block_id, floor_id) VALUES
('Electronics Lab', 'EL-101', 'Advanced electronics laboratory with modern equipment', 1, 1),
('Power Systems Lab', 'PS-201', 'Power systems and electrical machines laboratory', 1, 2),
('Computer Lab 1', 'CL-101', 'General purpose computer laboratory', 3, 1),
('Library Reading Room', 'LR-001', 'Main library reading area', 2, 1);

-- Insert sample user (for login testing)
INSERT INTO users (username, password) VALUES
('admin', 'admin123');

-- Verify data
SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS blocks_count FROM blocks;
SELECT COUNT(*) AS floors_count FROM floors;
SELECT COUNT(*) AS faculties_count FROM faculties;
SELECT COUNT(*) AS rooms_count FROM rooms;

