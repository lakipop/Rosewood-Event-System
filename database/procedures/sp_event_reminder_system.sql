-- ==========================================
-- EVENT REMINDER SYSTEM - Advanced Feature
-- Rosewood Event System
-- ==========================================

USE `rosewood_events_db`;

-- ==========================================
-- 1. CREATE REMINDER TRACKING TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS event_reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    reminder_type ENUM('event_upcoming', 'payment_due', 'final_confirmation', 'post_event_followup') NOT NULL,
    reminder_days INT NOT NULL,
    sent_at TIMESTAMP NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    recipient_email VARCHAR(255),
    message_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reminders_event 
        FOREIGN KEY (event_id) REFERENCES events(event_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_reminder_status (status),
    INDEX idx_reminder_event (event_id),
    INDEX idx_reminder_type (reminder_type)
) ENGINE=InnoDB;

-- ==========================================
-- 2. MAIN PROCEDURE: Generate Event Reminders
-- Uses CURSOR to iterate through events
-- ==========================================

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_generate_event_reminders$$

CREATE PROCEDURE sp_generate_event_reminders(
    OUT p_reminders_created INT,
    OUT p_message VARCHAR(500)
)
BEGIN
    DECLARE v_event_id INT;
    DECLARE v_event_name VARCHAR(200);
    DECLARE v_event_date DATE;
    DECLARE v_client_email VARCHAR(255);
    DECLARE v_client_name VARCHAR(100);
    DECLARE v_days_until INT;
    DECLARE v_balance DECIMAL(10,2);
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    
    -- 🔥 CURSOR: Loop through upcoming events
    DECLARE event_cursor CURSOR FOR
        SELECT 
            e.event_id,
            e.event_name,
            e.event_date,
            u.email,
            u.full_name,
            DATEDIFF(e.event_date, CURDATE()) as days_until,
            fn_calculate_balance(e.event_id) as balance
        FROM events e
        JOIN users u ON e.client_id = u.user_id
        WHERE e.status IN ('inquiry', 'confirmed')
        AND e.event_date >= CURDATE()
        AND e.event_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY e.event_date ASC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    SET p_reminders_created = 0;
    
    OPEN event_cursor;
    
    event_loop: LOOP
        FETCH event_cursor INTO v_event_id, v_event_name, v_event_date, 
                                v_client_email, v_client_name, v_days_until, v_balance;
        
        IF v_done THEN
            LEAVE event_loop;
        END IF;
        
        -- 🔥 REMINDER 1: 7 Days Before Event
        IF v_days_until = 7 THEN
            IF NOT EXISTS (
                SELECT 1 FROM event_reminders 
                WHERE event_id = v_event_id 
                AND reminder_type = 'event_upcoming' 
                AND reminder_days = 7
            ) THEN
                INSERT INTO event_reminders (
                    event_id, reminder_type, reminder_days, 
                    recipient_email, message_content, status
                )
                VALUES (
                    v_event_id, 
                    'event_upcoming', 
                    7,
                    v_client_email,
                    CONCAT('Dear ', v_client_name, ', your event "', v_event_name, 
                           '" is scheduled for ', DATE_FORMAT(v_event_date, '%M %d, %Y'), 
                           ' (7 days from now).'),
                    'pending'
                );
                SET p_reminders_created = p_reminders_created + 1;
            END IF;
        END IF;
        
        -- 🔥 REMINDER 2: 3 Days Before Event
        IF v_days_until = 3 THEN
            IF NOT EXISTS (
                SELECT 1 FROM event_reminders 
                WHERE event_id = v_event_id 
                AND reminder_type = 'event_upcoming' 
                AND reminder_days = 3
            ) THEN
                INSERT INTO event_reminders (
                    event_id, reminder_type, reminder_days,
                    recipient_email, message_content, status
                )
                VALUES (
                    v_event_id, 
                    'event_upcoming', 
                    3,
                    v_client_email,
                    CONCAT('Reminder: Your event "', v_event_name, 
                           '" is in 3 days on ', DATE_FORMAT(v_event_date, '%M %d, %Y'), '.'),
                    'pending'
                );
                SET p_reminders_created = p_reminders_created + 1;
            END IF;
        END IF;
        
        -- 🔥 REMINDER 3: Payment Due (if balance exists)
        IF v_balance > 0 AND v_days_until <= 5 THEN
            IF NOT EXISTS (
                SELECT 1 FROM event_reminders 
                WHERE event_id = v_event_id 
                AND reminder_type = 'payment_due'
                AND DATE(created_at) = CURDATE()
            ) THEN
                INSERT INTO event_reminders (
                    event_id, reminder_type, reminder_days,
                    recipient_email, message_content, status
                )
                VALUES (
                    v_event_id, 
                    'payment_due', 
                    v_days_until,
                    v_client_email,
                    CONCAT('Payment Reminder: Your event "', v_event_name, 
                           '" has an outstanding balance of $', 
                           FORMAT(v_balance, 2), '. Please settle before the event date.'),
                    'pending'
                );
                SET p_reminders_created = p_reminders_created + 1;
            END IF;
        END IF;
        
        -- 🔥 REMINDER 4: Final Confirmation (1 day before)
        IF v_days_until = 1 THEN
            IF NOT EXISTS (
                SELECT 1 FROM event_reminders 
                WHERE event_id = v_event_id 
                AND reminder_type = 'final_confirmation'
            ) THEN
                INSERT INTO event_reminders (
                    event_id, reminder_type, reminder_days,
                    recipient_email, message_content, status
                )
                VALUES (
                    v_event_id, 
                    'final_confirmation', 
                    1,
                    v_client_email,
                    CONCAT('Final Confirmation: Your event "', v_event_name, 
                           '" is tomorrow, ', DATE_FORMAT(v_event_date, '%M %d, %Y'), 
                           '. We look forward to making it memorable!'),
                    'pending'
                );
                SET p_reminders_created = p_reminders_created + 1;
            END IF;
        END IF;
        
    END LOOP;
    
    CLOSE event_cursor;
    
    SET p_message = CONCAT('Success: ', p_reminders_created, ' reminders created');
END$$

-- ==========================================
-- 3. GET PENDING REMINDERS (for email queue)
-- ==========================================

DROP PROCEDURE IF EXISTS sp_get_pending_reminders$$

CREATE PROCEDURE sp_get_pending_reminders()
BEGIN
    SELECT 
        r.reminder_id,
        r.event_id,
        e.event_name,
        r.reminder_type,
        r.reminder_days,
        r.recipient_email,
        u.full_name as client_name,
        r.message_content,
        e.event_date,
        DATEDIFF(e.event_date, CURDATE()) as days_until,
        fn_calculate_balance(e.event_id) as current_balance
    FROM event_reminders r
    JOIN events e ON r.event_id = e.event_id
    JOIN users u ON e.client_id = u.user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
    LIMIT 100;
END$$

-- ==========================================
-- 4. MARK REMINDER AS SENT
-- ==========================================

DROP PROCEDURE IF EXISTS sp_mark_reminder_sent$$

CREATE PROCEDURE sp_mark_reminder_sent(
    IN p_reminder_id INT,
    IN p_status ENUM('sent', 'failed'),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Error: Failed to update reminder status';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    UPDATE event_reminders
    SET status = p_status,
        sent_at = NOW()
    WHERE reminder_id = p_reminder_id;
    
    SET p_success = TRUE;
    SET p_message = CONCAT('Success: Reminder marked as ', p_status);
    
    COMMIT;
END$$

-- ==========================================
-- 5. VIEW: Reminder Dashboard
-- ==========================================

DROP VIEW IF EXISTS v_reminder_dashboard$$

CREATE VIEW v_reminder_dashboard AS
SELECT 
    DATE(r.created_at) as reminder_date,
    r.reminder_type,
    COUNT(*) as total_reminders,
    SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN r.status = 'sent' THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN r.status = 'failed' THEN 1 ELSE 0 END) as failed
FROM event_reminders r
GROUP BY DATE(r.created_at), r.reminder_type
ORDER BY reminder_date DESC$$

DELIMITER ;

-- ==========================================
-- USAGE EXAMPLES:
-- ==========================================

/*
-- 1. Generate reminders (run this daily via cron/scheduler):
CALL sp_generate_event_reminders(@count, @msg);
SELECT @count as reminders_created, @msg as message;

-- 2. Get pending reminders to send:
CALL sp_get_pending_reminders();

-- 3. Mark reminder as sent after email sent:
CALL sp_mark_reminder_sent(1, 'sent', @success, @msg);
SELECT @success, @msg;

-- 4. View reminder dashboard:
SELECT * FROM v_reminder_dashboard;

-- 5. View all pending reminders:
SELECT * FROM event_reminders WHERE status = 'pending';

-- 6. Check specific event reminders:
SELECT * FROM event_reminders WHERE event_id = 1;
*/

-- ==========================================
-- AUTOMATION SETUP (Optional):
-- ==========================================

/*
To automate this, create a MySQL EVENT (requires EVENT_SCHEDULER=ON):

SET GLOBAL event_scheduler = ON;

CREATE EVENT evt_daily_reminder_generation
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
    CALL sp_generate_event_reminders(@count, @msg);
*/
