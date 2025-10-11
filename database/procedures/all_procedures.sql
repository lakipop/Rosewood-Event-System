-- ==========================================
-- ALL STORED PROCEDURES - Rosewood Event System
-- Contains: 5 Basic + 3 Best Advanced Procedures
-- Manual Execution: Open in MySQL Workbench and execute
-- ==========================================

USE rosewood_events;

-- ==========================================
-- BASIC PROCEDURES (5)
-- ==========================================

-- 1. Create Event with Validation
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_create_event$$

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
DROP PROCEDURE IF EXISTS sp_add_event_service$$

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
DROP PROCEDURE IF EXISTS sp_process_payment$$

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
    
    SELECT budget INTO v_budget FROM events WHERE event_id = p_event_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid 
    FROM payments 
    WHERE event_id = p_event_id AND status = 'completed';
    
    IF (v_total_paid + p_amount) > v_budget THEN
        SET p_payment_id = 0;
        SET p_message = 'Warning: Payment exceeds budget';
    END IF;
    
    INSERT INTO payments (event_id, amount, payment_method, payment_type, payment_date, reference_number, status)
    VALUES (p_event_id, p_amount, p_payment_method, p_payment_type, NOW(), p_reference_number, 'completed');
    
    SET p_payment_id = LAST_INSERT_ID();
    
    IF p_message IS NULL THEN
        SET p_message = 'Success: Payment processed';
    END IF;
    
    COMMIT;
END$$

-- 4. Update Event Status
DROP PROCEDURE IF EXISTS sp_update_event_status$$

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
    
    SELECT status INTO v_old_status FROM events WHERE event_id = p_event_id;
    
    UPDATE events SET status = p_new_status WHERE event_id = p_event_id;
    
    INSERT INTO activity_logs (user_id, action_type, table_name, record_id, old_value, new_value)
    VALUES (p_user_id, 'status_updated', 'events', p_event_id, v_old_status, p_new_status);
    
    SET p_success = TRUE;
    SET p_message = 'Success: Event status updated';
    COMMIT;
END$$

-- 5. Get Event Summary
DROP PROCEDURE IF EXISTS sp_get_event_summary$$

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

-- ==========================================
-- ADVANCED PROCEDURES (Best 3 for Rosewood)
-- ==========================================

-- 6. Payment Reconciliation (Uses Cursors - ADBMS Feature)
DROP PROCEDURE IF EXISTS sp_reconcile_payments$$

CREATE PROCEDURE sp_reconcile_payments(
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT p_discrepancy_count INT,
    OUT p_total_discrepancy DECIMAL(10,2)
)
BEGIN
    DECLARE v_event_id INT;
    DECLARE v_event_name VARCHAR(200);
    DECLARE v_total_service_cost DECIMAL(10,2);
    DECLARE v_total_paid DECIMAL(10,2);
    DECLARE v_discrepancy DECIMAL(10,2);
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    
    DECLARE event_cursor CURSOR FOR
        SELECT 
            e.event_id,
            e.event_name,
            COALESCE(SUM(es.quantity * es.agreed_price), 0) as service_cost,
            COALESCE((SELECT SUM(p.amount) 
                     FROM payments p 
                     WHERE p.event_id = e.event_id 
                     AND p.status = 'completed'), 0) as total_paid
        FROM events e
        LEFT JOIN event_services es ON e.event_id = es.event_id 
            AND es.status != 'cancelled'
        WHERE e.event_date BETWEEN p_start_date AND p_end_date
        GROUP BY e.event_id
        HAVING service_cost != total_paid;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_reconciliation (
        event_id INT,
        event_name VARCHAR(200),
        service_cost DECIMAL(10,2),
        total_paid DECIMAL(10,2),
        discrepancy DECIMAL(10,2),
        status VARCHAR(50)
    );
    
    TRUNCATE TABLE temp_reconciliation;
    
    SET p_discrepancy_count = 0;
    SET p_total_discrepancy = 0;
    
    OPEN event_cursor;
    
    read_loop: LOOP
        FETCH event_cursor INTO v_event_id, v_event_name, v_total_service_cost, v_total_paid;
        
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_discrepancy = v_total_service_cost - v_total_paid;
        SET p_discrepancy_count = p_discrepancy_count + 1;
        SET p_total_discrepancy = p_total_discrepancy + ABS(v_discrepancy);
        
        INSERT INTO temp_reconciliation VALUES (
            v_event_id,
            v_event_name,
            v_total_service_cost,
            v_total_paid,
            v_discrepancy,
            CASE 
                WHEN v_discrepancy > 0 THEN 'UNDERPAID'
                WHEN v_discrepancy < 0 THEN 'OVERPAID'
                ELSE 'BALANCED'
            END
        );
    END LOOP;
    
    CLOSE event_cursor;
    
    SELECT * FROM temp_reconciliation ORDER BY ABS(discrepancy) DESC;
END$$

-- 7. Clone Event (Useful for recurring events)
DROP PROCEDURE IF EXISTS sp_clone_event$$

CREATE PROCEDURE sp_clone_event(
    IN p_source_event_id INT,
    IN p_new_date DATE,
    IN p_new_client_id INT,
    OUT p_new_event_id INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_event_type_id INT;
    DECLARE v_event_name VARCHAR(200);
    DECLARE v_event_time TIME;
    DECLARE v_venue VARCHAR(500);
    DECLARE v_guest_count INT;
    DECLARE v_budget DECIMAL(10,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_new_event_id = 0;
        SET p_message = 'Error: Failed to clone event';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    IF NOT EXISTS (SELECT 1 FROM events WHERE event_id = p_source_event_id) THEN
        SET p_new_event_id = 0;
        SET p_message = 'Error: Source event not found';
        ROLLBACK;
    ELSE
        SELECT 
            event_type_id, event_name, event_time, venue, guest_count, budget
        INTO 
            v_event_type_id, v_event_name, v_event_time, v_venue, v_guest_count, v_budget
        FROM events
        WHERE event_id = p_source_event_id;
        
        INSERT INTO events (
            client_id, event_type_id, event_name, event_date, event_time, 
            venue, guest_count, budget, status
        ) VALUES (
            p_new_client_id, v_event_type_id, CONCAT(v_event_name, ' (Copy)'),
            p_new_date, v_event_time, v_venue, v_guest_count, v_budget, 'inquiry'
        );
        
        SET p_new_event_id = LAST_INSERT_ID();
        
        INSERT INTO event_services (event_id, service_id, quantity, agreed_price, status)
        SELECT 
            p_new_event_id, service_id, quantity, agreed_price, 'pending'
        FROM event_services
        WHERE event_id = p_source_event_id AND status != 'cancelled';
        
        SET p_message = CONCAT('Success: Event cloned with ID ', p_new_event_id);
        COMMIT;
    END IF;
END$$

-- 8. Generate Monthly Report (Management reporting)
DROP PROCEDURE IF EXISTS sp_generate_monthly_report$$

CREATE PROCEDURE sp_generate_monthly_report(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        'ROSEWOOD EVENT SYSTEM - MONTHLY REPORT' as report_title,
        DATE_FORMAT(CONCAT(p_year, '-', p_month, '-01'), '%M %Y') as report_period,
        CURDATE() as generated_date;
    
    SELECT 
        'EVENTS SUMMARY' as section,
        COUNT(*) as total_events,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_events,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_events,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_events,
        ROUND(AVG(guest_count), 0) as avg_guest_count,
        ROUND(AVG(budget), 2) as avg_budget
    FROM events
    WHERE YEAR(event_date) = p_year AND MONTH(event_date) = p_month;
    
    SELECT 
        'REVENUE SUMMARY' as section,
        COUNT(DISTINCT event_id) as paid_events,
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_transaction,
        SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) as cash_revenue,
        SUM(CASE WHEN payment_method = 'card' THEN amount ELSE 0 END) as card_revenue,
        SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) as bank_revenue
    FROM payments
    WHERE YEAR(payment_date) = p_year AND MONTH(payment_date) = p_month
    AND status = 'completed';
    
    SELECT 
        'TOP SERVICES' as section,
        s.service_name,
        COUNT(*) as bookings,
        SUM(es.quantity) as total_quantity,
        SUM(es.quantity * es.agreed_price) as total_revenue
    FROM event_services es
    JOIN services s ON es.service_id = s.service_id
    JOIN events e ON es.event_id = e.event_id
    WHERE YEAR(e.event_date) = p_year AND MONTH(e.event_date) = p_month
    AND es.status != 'cancelled'
    GROUP BY s.service_id
    ORDER BY total_revenue DESC
    LIMIT 5;
END$$

DELIMITER ;

-- ==========================================
-- TOTAL: 8 Procedures (5 Basic + 3 Advanced)
-- Web App Usage Examples:
-- 
-- 1. Creating an event:
--    CALL sp_create_event(1, 1, 'John Wedding', '2024-06-15', '18:00:00', 'Grand Hotel', 150, 50000.00, @id, @msg);
-- 
-- 2. Adding service:
--    CALL sp_add_event_service(1, 2, 10, 1500.00, @success, @msg);
-- 
-- 3. Processing payment:
--    CALL sp_process_payment(1, 10000.00, 'bank_transfer', 'deposit', 'REF12345', @payment_id, @msg);
-- 
-- 4. Cloning event:
--    CALL sp_clone_event(5, '2024-12-25', 2, @new_id, @msg);
-- 
-- 5. Monthly report:
--    CALL sp_generate_monthly_report(2024, 3);
-- ==========================================
