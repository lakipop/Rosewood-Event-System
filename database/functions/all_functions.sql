-- ==========================================
-- User-Defined Functions for Rosewood Event System
-- ==========================================

-- 1. Calculate Total Event Cost
DELIMITER $$

CREATE FUNCTION fn_calculate_event_cost(p_event_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_cost DECIMAL(10,2);
    
    SELECT COALESCE(SUM(quantity * agreed_price), 0) 
    INTO total_cost
    FROM event_services
    WHERE event_id = p_event_id AND status != 'cancelled';
    
    RETURN total_cost;
END$$

-- 2. Calculate Total Payments for Event
CREATE FUNCTION fn_calculate_total_paid(p_event_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_paid DECIMAL(10,2);
    
    SELECT COALESCE(SUM(amount), 0) 
    INTO total_paid
    FROM payments
    WHERE event_id = p_event_id AND status = 'completed';
    
    RETURN total_paid;
END$$

-- 3. Calculate Remaining Balance
CREATE FUNCTION fn_calculate_balance(p_event_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_cost DECIMAL(10,2);
    DECLARE total_paid DECIMAL(10,2);
    
    SET total_cost = fn_calculate_event_cost(p_event_id);
    SET total_paid = fn_calculate_total_paid(p_event_id);
    
    RETURN total_cost - total_paid;
END$$

-- 4. Check if Event is Fully Paid
CREATE FUNCTION fn_is_event_paid(p_event_id INT)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE balance DECIMAL(10,2);
    
    SET balance = fn_calculate_balance(p_event_id);
    
    RETURN balance <= 0;
END$$

-- 5. Get Days Until Event
CREATE FUNCTION fn_days_until_event(p_event_date DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(p_event_date, CURDATE());
END$$

-- 6. Format Phone Number (Sri Lankan)
CREATE FUNCTION fn_format_phone(p_phone VARCHAR(20))
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE formatted VARCHAR(20);
    
    -- Remove spaces and special characters
    SET formatted = REPLACE(REPLACE(REPLACE(p_phone, ' ', ''), '-', ''), '(', '');
    SET formatted = REPLACE(REPLACE(formatted, ')', ''), '+', '');
    
    -- Format as +94 XX XXX XXXX
    IF LEFT(formatted, 2) = '94' THEN
        SET formatted = CONCAT('+94 ', SUBSTRING(formatted, 3, 2), ' ', 
                              SUBSTRING(formatted, 5, 3), ' ', 
                              SUBSTRING(formatted, 8));
    ELSEIF LEFT(formatted, 1) = '0' THEN
        SET formatted = CONCAT('+94 ', SUBSTRING(formatted, 2, 2), ' ', 
                              SUBSTRING(formatted, 4, 3), ' ', 
                              SUBSTRING(formatted, 7));
    END IF;
    
    RETURN formatted;
END$$

-- 7. Calculate Service Unit Total
CREATE FUNCTION fn_service_unit_total(p_quantity INT, p_unit_price DECIMAL(10,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    RETURN p_quantity * p_unit_price;
END$$

DELIMITER ;
