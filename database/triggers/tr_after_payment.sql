-- Sample Trigger: After Payment Insert
-- This will be implemented to demonstrate triggers

DELIMITER $$

CREATE TRIGGER tr_after_payment_insert
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    -- Trigger implementation will go here
    -- This could update event status, log activity, etc.
    
    -- Example: Log the payment
    INSERT INTO activity_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        new_value,
        created_at
    ) VALUES (
        NULL,
        'PAYMENT_CREATED',
        'payments',
        NEW.payment_id,
        CONCAT('Amount: ', NEW.amount, ', Method: ', NEW.payment_method),
        NOW()
    );
END$$

DELIMITER ;
