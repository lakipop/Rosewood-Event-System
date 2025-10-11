-- ==========================================
-- Stored Procedures for Rosewood Event System
-- ==========================================

-- 1. Create Event with Validation
DELIMITER $$

CREATE PROCEDURE sp_create_event(
    IN p_client_id INT,
    IN p_event_type_id INT,
    IN p_event_name VARCHAR(200),
    IN p_event_date DATE,
    IN p_event_time TIME,
    IN p_venue VARCHAR(500),
    IN p_guest_count INT,
    IN p_budget DECIMAL(10,2),
    OUT p_event_id INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_event_id = 0;
        SET p_message = 'Error: Failed to create event';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Validate client exists and is active
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = p_client_id AND status = 'active') THEN
        SET p_event_id = 0;
        SET p_message = 'Error: Invalid or inactive client';
        ROLLBACK;
    ELSE
        -- Insert the event
        INSERT INTO events (
            client_id, event_type_id, event_name, event_date, 
            event_time, venue, guest_count, budget, status
        ) VALUES (
            p_client_id, p_event_type_id, p_event_name, p_event_date,
            p_event_time, p_venue, p_guest_count, p_budget, 'inquiry'
        );
        
        SET p_event_id = LAST_INSERT_ID();
        SET p_message = 'Success: Event created';
        COMMIT;
    END IF;
END$$

-- 2. Add Service to Event
CREATE PROCEDURE sp_add_event_service(
    IN p_event_id INT,
    IN p_service_id INT,
    IN p_quantity INT,
    IN p_agreed_price DECIMAL(10,2),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_service_available BOOLEAN;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Error: Failed to add service';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Check if service is available
    SELECT is_available INTO v_service_available 
    FROM services 
    WHERE service_id = p_service_id;
    
    IF v_service_available = FALSE OR v_service_available IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'Error: Service not available';
        ROLLBACK;
    ELSE
        INSERT INTO event_services (event_id, service_id, quantity, agreed_price, status)
        VALUES (p_event_id, p_service_id, p_quantity, p_agreed_price, 'pending');
        
        SET p_success = TRUE;
        SET p_message = 'Success: Service added to event';
        COMMIT;
    END IF;
END$$

-- 3. Process Payment
CREATE PROCEDURE sp_process_payment(
    IN p_event_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_payment_method VARCHAR(50),
    IN p_payment_type VARCHAR(50),
    IN p_reference_number VARCHAR(100),
    OUT p_payment_id INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    DECLARE v_budget DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_payment_id = 0;
        SET p_message = 'Error: Payment processing failed';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Get event budget and total paid
    SELECT budget INTO v_budget FROM events WHERE event_id = p_event_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid 
    FROM payments 
    WHERE event_id = p_event_id AND status = 'completed';
    
    -- Check if payment exceeds budget
    IF (v_total_paid + p_amount) > v_budget THEN
        SET p_payment_id = 0;
        SET p_message = 'Warning: Payment exceeds budget';
    END IF;
    
    -- Insert payment
    INSERT INTO payments (event_id, amount, payment_method, payment_type, payment_date, reference_number, status)
    VALUES (p_event_id, p_amount, p_payment_method, p_payment_type, NOW(), p_reference_number, 'completed');
    
    SET p_payment_id = LAST_INSERT_ID();
    
    IF p_message IS NULL THEN
        SET p_message = 'Success: Payment processed';
    END IF;
    
    COMMIT;
END$$

-- 4. Update Event Status
CREATE PROCEDURE sp_update_event_status(
    IN p_event_id INT,
    IN p_new_status VARCHAR(50),
    IN p_user_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_old_status VARCHAR(50);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Error: Failed to update status';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Get old status
    SELECT status INTO v_old_status FROM events WHERE event_id = p_event_id;
    
    -- Update status
    UPDATE events SET status = p_new_status WHERE event_id = p_event_id;
    
    -- Log the change
    INSERT INTO activity_logs (user_id, action_type, table_name, record_id, old_value, new_value)
    VALUES (p_user_id, 'status_updated', 'events', p_event_id, v_old_status, p_new_status);
    
    SET p_success = TRUE;
    SET p_message = 'Success: Event status updated';
    COMMIT;
END$$

-- 5. Get Event Summary
CREATE PROCEDURE sp_get_event_summary(
    IN p_event_id INT
)
BEGIN
    SELECT 
        e.event_id,
        e.event_name,
        e.event_date,
        e.venue,
        e.guest_count,
        e.budget,
        e.status,
        et.type_name,
        u.full_name as client_name,
        u.email as client_email,
        u.phone as client_phone,
        COALESCE(SUM(es.quantity * es.agreed_price), 0) as total_service_cost,
        COALESCE(SUM(p.amount), 0) as total_paid
    FROM events e
    JOIN event_types et ON e.event_type_id = et.event_type_id
    JOIN users u ON e.client_id = u.user_id
    LEFT JOIN event_services es ON e.event_id = es.event_id
    LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
    WHERE e.event_id = p_event_id
    GROUP BY e.event_id;
END$$

DELIMITER ;
