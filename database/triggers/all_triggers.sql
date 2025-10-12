-- ==========================================
-- ALL TRIGGERS - Rosewood Event System
-- Contains: 8 Basic + 3 Best Advanced Triggers
-- Manual Execution: Open in MySQL Workbench and execute
-- ==========================================

USE `rosewood-events-db`;

-- ==========================================
-- BASIC TRIGGERS (8)
-- ==========================================

DELIMITER $$

-- 1. Log Payment Activity
DROP TRIGGER IF EXISTS tr_after_payment_insert$$

CREATE TRIGGER tr_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action_type, table_name, record_id, new_value, created_at)
    VALUES (1, 'payment_created', 'payments', NEW.payment_id, 
            CONCAT('Amount: ', NEW.amount, ', Method: ', NEW.payment_method), NOW());
END$$

-- 2. Log Payment Updates
DROP TRIGGER IF EXISTS tr_after_payment_update$$

CREATE TRIGGER tr_after_payment_update
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action_type, table_name, record_id, old_value, new_value, created_at)
    VALUES (1, 'payment_updated', 'payments', NEW.payment_id,
            CONCAT('Status: ', OLD.status), 
            CONCAT('Status: ', NEW.status), NOW());
END$$

-- 3. Auto Update Event Status When Fully Paid
DROP TRIGGER IF EXISTS tr_update_event_status_on_payment$$

CREATE TRIGGER tr_update_event_status_on_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE v_total_cost DECIMAL(10,2);
    DECLARE v_total_paid DECIMAL(10,2);
    
    SELECT COALESCE(SUM(quantity * agreed_price), 0) INTO v_total_cost
    FROM event_services
    WHERE event_id = NEW.event_id AND status != 'cancelled';
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM payments
    WHERE event_id = NEW.event_id AND status = 'completed';
    
    IF v_total_paid >= v_total_cost AND v_total_cost > 0 THEN
        UPDATE events 
        SET status = 'confirmed' 
        WHERE event_id = NEW.event_id AND status = 'inquiry';
    END IF;
END$$

-- 4. Log Event Creation
DROP TRIGGER IF EXISTS tr_after_event_insert$$

CREATE TRIGGER tr_after_event_insert
AFTER INSERT ON events
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action_type, table_name, record_id, new_value, created_at)
    VALUES (NEW.client_id, 'event_created', 'events', NEW.event_id,
            CONCAT('Event: ', NEW.event_name, ', Date: ', NEW.event_date), NOW());
END$$

-- 5. Log Event Status Changes
DROP TRIGGER IF EXISTS tr_after_event_status_update$$

CREATE TRIGGER tr_after_event_status_update
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (user_id, action_type, table_name, record_id, old_value, new_value, created_at)
        VALUES (NEW.client_id, 'event_status_changed', 'events', NEW.event_id,
                OLD.status, NEW.status, NOW());
    END IF;
END$$

-- 6. Log Service Addition
DROP TRIGGER IF EXISTS tr_after_service_add$$

CREATE TRIGGER tr_after_service_add
AFTER INSERT ON event_services
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action_type, table_name, record_id, new_value, created_at)
    VALUES (1, 'service_added', 'event_services', NEW.event_service_id,
            CONCAT('Event: ', NEW.event_id, ', Service: ', NEW.service_id, 
                   ', Qty: ', NEW.quantity), NOW());
END$$

-- 7. Validate Payment Amount
DROP TRIGGER IF EXISTS tr_before_payment_insert$$

CREATE TRIGGER tr_before_payment_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount must be greater than zero';
    END IF;
END$$

-- 8. Set Payment Date if Null
DROP TRIGGER IF EXISTS tr_before_payment_insert_date$$

CREATE TRIGGER tr_before_payment_insert_date
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.payment_date IS NULL THEN
        SET NEW.payment_date = NOW();
    END IF;
    
    IF NEW.status IS NULL THEN
        SET NEW.status = 'pending';
    END IF;
END$$

-- ==========================================
-- ADVANCED TRIGGERS (Best 3 for Rosewood)
-- ==========================================

-- 9. Cascade Event Cancellation (Cancel all services when event cancelled)
DROP TRIGGER IF EXISTS tr_cascade_event_cancellation$$

CREATE TRIGGER tr_cascade_event_cancellation
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE event_services
        SET status = 'cancelled'
        WHERE event_id = NEW.event_id
        AND status NOT IN ('cancelled', 'completed');
        
        INSERT INTO activity_logs (user_id, action_type, table_name, record_id, new_value, created_at)
        VALUES (NEW.client_id, 'event_cancelled_cascade', 'events', NEW.event_id,
                'All services automatically cancelled', NOW());
    END IF;
END$$

-- 10. Generate Payment Reference Number
DROP TRIGGER IF EXISTS tr_generate_payment_reference$$

CREATE TRIGGER tr_generate_payment_reference
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
        SET NEW.reference_number = CONCAT(
            'PAY-',
            DATE_FORMAT(NOW(), '%Y%m%d'),
            '-',
            LPAD(NEW.event_id, 5, '0'),
            '-',
            SUBSTRING(MD5(CONCAT(NEW.event_id, NOW())), 1, 6)
        );
    END IF;
END$$

-- 11. Budget Overrun Warning Log
DROP TRIGGER IF EXISTS tr_budget_overrun_warning$$

CREATE TRIGGER tr_budget_overrun_warning
AFTER INSERT ON event_services
FOR EACH ROW
BEGIN
    DECLARE v_total_cost DECIMAL(10,2);
    DECLARE v_budget DECIMAL(10,2);
    
    SELECT COALESCE(SUM(quantity * agreed_price), 0) INTO v_total_cost
    FROM event_services
    WHERE event_id = NEW.event_id AND status != 'cancelled';
    
    SELECT budget INTO v_budget
    FROM events
    WHERE event_id = NEW.event_id;
    
    IF v_total_cost > v_budget THEN
        INSERT INTO activity_logs (user_id, action_type, table_name, record_id, new_value, created_at)
        VALUES (1, 'budget_overrun_warning', 'events', NEW.event_id,
                CONCAT('Budget: ', v_budget, ', Total Cost: ', v_total_cost, 
                       ' (Overrun: ', (v_total_cost - v_budget), ')'), NOW());
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- TOTAL: 11 Triggers (8 Basic + 3 Advanced)
-- 
-- Automatic Actions:
-- 1. Logs all payment activities
-- 2. Auto-confirms events when fully paid
-- 3. Logs all event changes
-- 4. Validates payment amounts
-- 5. Generates payment reference numbers
-- 6. Cascades event cancellations to services
-- 7. Warns about budget overruns
-- 
-- These triggers work automatically in the background
-- No manual calling needed from web app
-- ==========================================
