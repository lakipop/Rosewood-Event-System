-- ==========================================
-- Triggers for Rosewood Event System
-- ==========================================

-- 1. Log Payment Creation
DELIMITER $$

CREATE TRIGGER tr_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        user_id, 
        action_type, 
        table_name, 
        record_id, 
        new_value,
        ip_address
    ) VALUES (
        (SELECT client_id FROM events WHERE event_id = NEW.event_id),
        'payment_made',
        'payments',
        NEW.payment_id,
        CONCAT('Rs. ', NEW.amount, ' - ', NEW.payment_type),
        '127.0.0.1'
    );
END$$

-- 2. Update Event Status When Fully Paid
CREATE TRIGGER tr_check_full_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    DECLARE total_cost DECIMAL(10,2);
    DECLARE total_paid DECIMAL(10,2);
    
    -- Calculate totals
    SELECT COALESCE(SUM(quantity * agreed_price), 0) INTO total_cost
    FROM event_services
    WHERE event_id = NEW.event_id AND status != 'cancelled';
    
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM payments
    WHERE event_id = NEW.event_id AND status = 'completed';
    
    -- Update event status if fully paid
    IF total_paid >= total_cost AND total_cost > 0 THEN
        UPDATE events 
        SET status = 'confirmed' 
        WHERE event_id = NEW.event_id AND status = 'inquiry';
    END IF;
END$$

-- 3. Log Event Creation
CREATE TRIGGER tr_after_event_insert
AFTER INSERT ON events
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        new_value,
        ip_address
    ) VALUES (
        NEW.client_id,
        'event_created',
        'events',
        NEW.event_id,
        NEW.event_name,
        '127.0.0.1'
    );
END$$

-- 4. Log Event Status Changes
CREATE TRIGGER tr_after_event_update
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activity_logs (
            user_id,
            action_type,
            table_name,
            record_id,
            old_value,
            new_value,
            ip_address
        ) VALUES (
            NEW.client_id,
            'status_updated',
            'events',
            NEW.event_id,
            OLD.status,
            NEW.status,
            '127.0.0.1'
        );
    END IF;
END$$

-- 5. Log Service Addition to Event
CREATE TRIGGER tr_after_event_service_insert
AFTER INSERT ON event_services
FOR EACH ROW
BEGIN
    DECLARE service_name VARCHAR(200);
    DECLARE client_id INT;
    
    SELECT s.service_name INTO service_name 
    FROM services s
    WHERE s.service_id = NEW.service_id;
    
    SELECT e.client_id INTO client_id 
    FROM events e
    WHERE e.event_id = NEW.event_id;
    
    INSERT INTO activity_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        new_value,
        ip_address
    ) VALUES (
        client_id,
        'service_added',
        'event_services',
        NEW.event_service_id,
        service_name,
        '127.0.0.1'
    );
END$$

-- 6. Prevent Deletion of Paid Events
CREATE TRIGGER tr_before_event_delete
BEFORE DELETE ON events
FOR EACH ROW
BEGIN
    DECLARE payment_count INT;
    
    SELECT COUNT(*) INTO payment_count
    FROM payments
    WHERE event_id = OLD.event_id AND status = 'completed';
    
    IF payment_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete event with completed payments';
    END IF;
END$$

-- 7. Validate Payment Amount
CREATE TRIGGER tr_before_payment_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Payment amount must be greater than zero';
    END IF;
END$$

-- 8. Update Event Timestamp
CREATE TRIGGER tr_before_event_update_timestamp
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;
