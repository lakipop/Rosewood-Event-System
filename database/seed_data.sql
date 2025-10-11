-- Seed Data for Rosewood Event System
-- Run this after creating tables

-- Insert Event Types
INSERT INTO event_types (type_name, description, base_price, is_active) VALUES
('Wedding', 'Traditional and modern wedding ceremonies', 5000.00, TRUE),
('Corporate Event', 'Business conferences, seminars, and meetings', 3000.00, TRUE),
('Birthday Party', 'Birthday celebrations for all ages', 1500.00, TRUE),
('Anniversary', 'Wedding anniversaries and milestone celebrations', 2000.00, TRUE),
('Conference', 'Professional conferences and conventions', 4000.00, TRUE),
('Exhibition', 'Trade shows and exhibitions', 3500.00, TRUE),
('Charity Event', 'Fundraising and charity galas', 2500.00, TRUE),
('Festival', 'Cultural and music festivals', 6000.00, TRUE);

-- Insert Services
INSERT INTO services (service_name, category, description, unit_price, unit_type, is_available) VALUES
('Catering - Basic', 'Food & Beverage', 'Standard catering with appetizers and main course', 35.00, 'per_person', TRUE),
('Catering - Premium', 'Food & Beverage', 'Premium catering with multiple courses', 65.00, 'per_person', TRUE),
('Photography - Basic', 'Photography', 'Basic photography package (4 hours)', 500.00, 'fixed', TRUE),
('Photography - Premium', 'Photography', 'Premium photography with videography (8 hours)', 1200.00, 'fixed', TRUE),
('DJ Services', 'Entertainment', 'Professional DJ with sound system', 600.00, 'fixed', TRUE),
('Live Band', 'Entertainment', 'Live music band (4 hours)', 1500.00, 'fixed', TRUE),
('Decoration - Simple', 'Decoration', 'Basic floral and table decorations', 800.00, 'fixed', TRUE),
('Decoration - Elaborate', 'Decoration', 'Premium decorations with themed setup', 2500.00, 'fixed', TRUE),
('Venue Setup', 'Venue', 'Tables, chairs, and basic setup', 400.00, 'fixed', TRUE),
('Lighting System', 'Technical', 'Professional lighting setup', 700.00, 'fixed', TRUE),
('Audio System', 'Technical', 'Professional audio equipment', 500.00, 'fixed', TRUE),
('Video Recording', 'Photography', 'Professional videography service', 800.00, 'fixed', TRUE),
('Master of Ceremonies', 'Entertainment', 'Professional MC/Host', 400.00, 'fixed', TRUE),
('Transportation', 'Logistics', 'Guest transportation service', 50.00, 'per_vehicle', TRUE),
('Security Services', 'Security', 'Professional event security', 300.00, 'per_guard', TRUE);

-- Insert Sample Users (password for all is 'Password123')
-- Note: These password hashes are for 'Password123' using bcrypt with 10 rounds
INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES
('admin@rosewood.com', '$2a$10$YourHashHere', 'Admin User', '+1234567890', 'admin', 'active'),
('manager@rosewood.com', '$2a$10$YourHashHere', 'Manager User', '+1234567891', 'manager', 'active'),
('john.doe@email.com', '$2a$10$YourHashHere', 'John Doe', '+1234567892', 'client', 'active'),
('jane.smith@email.com', '$2a$10$YourHashHere', 'Jane Smith', '+1234567893', 'client', 'active'),
('robert.brown@email.com', '$2a$10$YourHashHere', 'Robert Brown', '+1234567894', 'client', 'active');

-- Note: You'll need to update the password_hash values with actual bcrypt hashes
-- You can generate them using: bcrypt.hash('Password123', 10)
