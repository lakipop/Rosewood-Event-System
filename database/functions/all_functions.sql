-- ==========================================
-- ALL FUNCTIONS - Rosewood Event System
-- Contains: 7 Basic + 3 Best Advanced Functions
-- Manual Execution: Open in MySQL Workbench and execute
-- ==========================================

USE `rosewood-events-db`;

-- ==========================================
-- BASIC FUNCTIONS (7)
-- ==========================================

DELIMITER $$

-- 1. Calculate Event Cost (from services)
DROP FUNCTION IF EXISTS fn_calculate_event_cost$$

CREATE FUNCTION fn_calculate_event_cost(p_event_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    
    SELECT COALESCE(SUM(quantity * agreed_price), 0)
    INTO v_total
    FROM event_services
    WHERE event_id = p_event_id AND status != 'cancelled';
    
    RETURN v_total;
END$$

-- 2. Calculate Total Paid
DROP FUNCTION IF EXISTS fn_calculate_total_paid$$

CREATE FUNCTION fn_calculate_total_paid(p_event_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total DECIMAL(10,2);
    
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total
    FROM payments
    WHERE event_id = p_event_id AND status = 'completed';
    
    RETURN v_total;
END$$

-- 3. Calculate Balance
DROP FUNCTION IF EXISTS fn_calculate_balance$$

CREATE FUNCTION fn_calculate_balance(p_event_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_cost DECIMAL(10,2);
    DECLARE v_paid DECIMAL(10,2);
    
    SET v_cost = fn_calculate_event_cost(p_event_id);
    SET v_paid = fn_calculate_total_paid(p_event_id);
    
    RETURN v_cost - v_paid;
END$$

-- 4. Check if Event is Fully Paid
DROP FUNCTION IF EXISTS fn_is_event_paid$$

CREATE FUNCTION fn_is_event_paid(p_event_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_balance DECIMAL(10,2);
    
    SET v_balance = fn_calculate_balance(p_event_id);
    
    RETURN v_balance <= 0;
END$$

-- 5. Days Until Event
DROP FUNCTION IF EXISTS fn_days_until_event$$

CREATE FUNCTION fn_days_until_event(p_event_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_event_date DATE;
    DECLARE v_days INT;
    
    SELECT event_date INTO v_event_date
    FROM events
    WHERE event_id = p_event_id;
    
    SET v_days = DATEDIFF(v_event_date, CURDATE());
    
    RETURN v_days;
END$$

-- 6. Format Phone Number
DROP FUNCTION IF EXISTS fn_format_phone$$

CREATE FUNCTION fn_format_phone(p_phone VARCHAR(20))
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_clean VARCHAR(20);
    
    SET v_clean = REGEXP_REPLACE(p_phone, '[^0-9]', '');
    
    IF LENGTH(v_clean) = 10 THEN
        RETURN CONCAT('(', SUBSTRING(v_clean, 1, 3), ') ', 
                     SUBSTRING(v_clean, 4, 3), '-', 
                     SUBSTRING(v_clean, 7, 4));
    ELSE
        RETURN p_phone;
    END IF;
END$$

-- 7. Calculate Service Unit Total
DROP FUNCTION IF EXISTS fn_service_unit_total$$

CREATE FUNCTION fn_service_unit_total(p_service_id INT, p_quantity INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_price DECIMAL(10,2);
    
    SELECT base_price INTO v_price
    FROM services
    WHERE service_id = p_service_id;
    
    RETURN v_price * p_quantity;
END$$

-- ==========================================
-- ADVANCED FUNCTIONS (Best 3 for Rosewood)
-- ==========================================

-- 8. Event Profitability Score (Already in DB)
DROP FUNCTION IF EXISTS fn_event_profitability$$

CREATE FUNCTION fn_event_profitability(p_event_id INT)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_revenue DECIMAL(10,2);
    DECLARE v_cost DECIMAL(10,2);
    DECLARE v_profit_margin DECIMAL(5,2);
    
    SELECT COALESCE(SUM(amount), 0) INTO v_revenue
    FROM payments
    WHERE event_id = p_event_id AND status = 'completed';
    
    SELECT COALESCE(SUM(quantity * agreed_price * 0.7), 0) INTO v_cost
    FROM event_services
    WHERE event_id = p_event_id AND status != 'cancelled';
    
    IF v_revenue = 0 THEN
        RETURN 0;
    END IF;
    
    SET v_profit_margin = ((v_revenue - v_cost) / v_revenue) * 100;
    
    RETURN ROUND(v_profit_margin, 2);
END$$

-- 9. Client Lifetime Value (LTV)
DROP FUNCTION IF EXISTS fn_calculate_client_ltv$$

CREATE FUNCTION fn_calculate_client_ltv(p_client_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total_revenue DECIMAL(10,2);
    
    SELECT COALESCE(SUM(p.amount), 0) INTO v_total_revenue
    FROM payments p
    JOIN events e ON p.event_id = e.event_id
    WHERE e.client_id = p_client_id
    AND p.status = 'completed';
    
    RETURN v_total_revenue;
END$$

-- 10. Payment Status Description
DROP FUNCTION IF EXISTS fn_payment_status$$

CREATE FUNCTION fn_payment_status(p_event_id INT)
RETURNS VARCHAR(50)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_balance DECIMAL(10,2);
    DECLARE v_cost DECIMAL(10,2);
    DECLARE v_paid DECIMAL(10,2);
    DECLARE v_percentage DECIMAL(5,2);
    
    SET v_cost = fn_calculate_event_cost(p_event_id);
    SET v_paid = fn_calculate_total_paid(p_event_id);
    SET v_balance = v_cost - v_paid;
    
    IF v_cost = 0 THEN
        RETURN 'NO_SERVICES';
    ELSEIF v_balance <= 0 THEN
        RETURN 'FULLY_PAID';
    ELSE
        SET v_percentage = (v_paid / v_cost) * 100;
        
        IF v_percentage = 0 THEN
            RETURN 'NOT_PAID';
        ELSEIF v_percentage < 50 THEN
            RETURN 'PARTIALLY_PAID_LOW';
        ELSEIF v_percentage < 100 THEN
            RETURN 'PARTIALLY_PAID_HIGH';
        ELSE
            RETURN 'OVERPAID';
        END IF;
    END IF;
END$$

DELIMITER ;

-- ==========================================
-- TOTAL: 10 Functions (7 Basic + 3 Advanced)
-- Web App Usage Examples:
--
-- 1. Calculate event cost:
--    SELECT fn_calculate_event_cost(1) as event_cost;
--
-- 2. Check payment balance:
--    SELECT fn_calculate_balance(1) as balance;
--
-- 3. Check if paid:
--    SELECT fn_is_event_paid(1) as is_paid;
--
-- 4. Days until event:
--    SELECT fn_days_until_event(1) as days_remaining;
--
-- 5. Payment status:
--    SELECT fn_payment_status(1) as payment_status;
--
-- 6. Client lifetime value:
--    SELECT fn_calculate_client_ltv(5) as client_ltv;
--
-- 7. Event profitability:
--    SELECT fn_event_profitability(1) as profit_margin;
--
-- Usage in queries:
--    SELECT event_id, event_name, 
--           fn_calculate_event_cost(event_id) as cost,
--           fn_calculate_total_paid(event_id) as paid,
--           fn_calculate_balance(event_id) as balance,
--           fn_payment_status(event_id) as status
--    FROM events;
-- ==========================================
