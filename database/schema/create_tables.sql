-- Rosewood Event System - Database Schema
-- This file contains the complete table structure for the event management system

-- Database creation (run this first if needed)
-- CREATE DATABASE IF NOT EXISTS rosewood_events;
-- USE `rosewood-events-db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'manager', 'client') NOT NULL DEFAULT 'client',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Event Types Table
CREATE TABLE IF NOT EXISTS event_types (
  event_type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Services Table
CREATE TABLE IF NOT EXISTS services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  unit_price DECIMAL(10,2) DEFAULT 0,
  unit_type VARCHAR(20) DEFAULT 'fixed',
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_service_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

-- 4. Events Table
CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT,
  event_type_id INT,
  event_name VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  venue VARCHAR(255),
  guest_count INT DEFAULT 50,
  budget DECIMAL(12,2),
  status ENUM('inquiry','confirmed','completed','cancelled') DEFAULT 'inquiry',
  special_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_client 
    FOREIGN KEY (client_id) REFERENCES users(user_id) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_events_type 
    FOREIGN KEY (event_type_id) REFERENCES event_types(event_type_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_events_guest_count CHECK (guest_count IS NULL OR guest_count > 0),
  CONSTRAINT chk_events_budget CHECK (budget IS NULL OR budget > 0),
  INDEX idx_events_date_status (event_date, status),
  INDEX idx_events_client (client_id),
  INDEX idx_events_type (event_type_id)
) ENGINE=InnoDB;

-- 5. Event Services Table (Junction)
CREATE TABLE IF NOT EXISTS event_services (
  event_service_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT DEFAULT 1,
  agreed_price DECIMAL(10,2),
  status ENUM('pending','confirmed','delivered') DEFAULT 'pending',
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_services_event 
    FOREIGN KEY (event_id) REFERENCES events(event_id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_event_services_service 
    FOREIGN KEY (service_id) REFERENCES services(service_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_event_services_quantity CHECK (quantity > 0),
  CONSTRAINT chk_event_services_price CHECK (agreed_price IS NULL OR agreed_price >= 0),
  INDEX idx_event_services_event (event_id),
  INDEX idx_event_services_service (service_id)
) ENGINE=InnoDB;

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','card','bank_transfer','online') NOT NULL,
  payment_type ENUM('advance','partial','final') NOT NULL,
  payment_date DATE NOT NULL,
  reference_number VARCHAR(100),
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_event 
    FOREIGN KEY (event_id) REFERENCES events(event_id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_payments_amount CHECK (amount > 0),
  INDEX idx_payments_event (event_id),
  INDEX idx_payments_date (payment_date)
) ENGINE=InnoDB;

-- 7. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action_type VARCHAR(50),
  table_name VARCHAR(50),
  record_id INT,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user 
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_table_record (table_name, record_id),
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;
