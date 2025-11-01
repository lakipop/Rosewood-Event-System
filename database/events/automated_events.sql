-- ==========================================
-- MYSQL SCHEDULED EVENTS - Rosewood Event System
-- These run automatically in the background
-- ==========================================

USE `rosewood_events_db`;

-- ==========================================
-- STEP 1: Enable Event Scheduler (Required)
-- ==========================================

SET GLOBAL event_scheduler = ON;

-- ==========================================
-- EVENT 1: Auto-Complete Past Events
-- Runs: Daily at 2:00 AM
-- Purpose: Marks past confirmed events as completed
-- ==========================================

DROP EVENT IF EXISTS evt_auto_complete_past_events;

DELIMITER $$

CREATE EVENT evt_auto_complete_past_events
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 2 HOUR
DO
BEGIN
    UPDATE events
    SET status = 'completed',
        updated_at = NOW()
    WHERE event_date < CURDATE()
    AND status = 'confirmed';
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'auto_complete_events', 'events',
            CONCAT('Auto-completed ', ROW_COUNT(), ' past events'), NOW());
END$$

DELIMITER ;

-- ==========================================
-- EVENT 2: Generate Daily Event Reminders
-- Runs: Daily at 9:00 AM
-- Purpose: Creates reminders for upcoming events
-- ==========================================

DROP EVENT IF EXISTS evt_daily_reminder_generation;

DELIMITER $$

CREATE EVENT evt_daily_reminder_generation
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 9 HOUR
DO
BEGIN
    DECLARE v_count INT;
    DECLARE v_message VARCHAR(500);
    
    CALL sp_generate_event_reminders(v_count, v_message);
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'reminder_generation', 'system', 
            CONCAT('Generated ', v_count, ' reminders'), NOW());
END$$

DELIMITER ;

-- ==========================================
-- EVENT 3: Auto-Cancel Unpaid Inquiries
-- Runs: Daily at 3:00 AM
-- Purpose: Cancels inquiries older than 30 days with no payment
-- ==========================================

DROP EVENT IF EXISTS evt_auto_cancel_old_inquiries;

DELIMITER $$

CREATE EVENT evt_auto_cancel_old_inquiries
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 3 HOUR
DO
BEGIN
    UPDATE events e
    SET e.status = 'cancelled',
        e.special_notes = CONCAT(COALESCE(e.special_notes, ''), 
                                 '\n[AUTO-CANCELLED: No payment after 30 days]'),
        e.updated_at = NOW()
    WHERE e.status = 'inquiry'
    AND e.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND NOT EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.event_id = e.event_id 
        AND p.status = 'completed'
    );
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'auto_cancel_inquiry', 'events',
            CONCAT('Auto-cancelled ', ROW_COUNT(), ' old inquiries'), NOW());
END$$

DELIMITER ;

-- ==========================================
-- EVENT 4: Clean Old Activity Logs
-- Runs: Monthly on 1st day at 4:00 AM
-- Purpose: Removes logs older than 6 months
-- ==========================================

DROP EVENT IF EXISTS evt_cleanup_old_logs;

DELIMITER $$

CREATE EVENT evt_cleanup_old_logs
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_DATE + INTERVAL 4 HOUR
DO
BEGIN
    DECLARE v_deleted INT;
    
    DELETE FROM activity_logs
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
    
    SET v_deleted = ROW_COUNT();
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'log_cleanup', 'activity_logs',
            CONCAT('Cleaned ', v_deleted, ' old log entries'), NOW());
END$$

DELIMITER ;

-- ==========================================
-- EVENT 5: Weekly Payment Follow-up Flag
-- Runs: Every Monday at 10:00 AM
-- Purpose: Flags events with overdue payments
-- ==========================================

DROP EVENT IF EXISTS evt_weekly_payment_followup;

DELIMITER $$

CREATE EVENT evt_weekly_payment_followup
ON SCHEDULE EVERY 1 WEEK
STARTS DATE_ADD(CURRENT_DATE, INTERVAL (8 - WEEKDAY(CURRENT_DATE)) % 7 DAY) + INTERVAL 10 HOUR
DO
BEGIN
    UPDATE events e
    SET e.special_notes = CONCAT(
            COALESCE(e.special_notes, ''), 
            '\n[PAYMENT FOLLOW-UP REQUIRED - ', DATE_FORMAT(NOW(), '%Y-%m-%d'), ']'
        ),
        e.updated_at = NOW()
    WHERE e.status IN ('inquiry', 'confirmed')
    AND e.event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    AND fn_calculate_balance(e.event_id) > 0
    AND e.special_notes NOT LIKE '%PAYMENT FOLLOW-UP REQUIRED%';
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'payment_followup_flag', 'events',
            CONCAT('Flagged ', ROW_COUNT(), ' events for payment follow-up'), NOW());
END$$

DELIMITER ;

-- ==========================================
-- EVENT 6: Monthly Statistics Generation
-- Runs: 1st of every month at 1:00 AM
-- Purpose: Generates monthly performance stats
-- ==========================================

DROP EVENT IF EXISTS evt_monthly_stats_generation;

DELIMITER $$

CREATE EVENT evt_monthly_stats_generation
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_DATE + INTERVAL 1 HOUR
DO
BEGIN
    DECLARE v_total_events INT;
    DECLARE v_total_revenue DECIMAL(10,2);
    DECLARE v_active_clients INT;
    
    SELECT COUNT(*) INTO v_total_events
    FROM events
    WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH));
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
    FROM payments
    WHERE status = 'completed'
    AND MONTH(payment_date) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    AND YEAR(payment_date) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH));
    
    SELECT COUNT(DISTINCT client_id) INTO v_active_clients
    FROM events
    WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
    AND YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH));
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'monthly_stats', 'system',
            CONCAT('Month: ', DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m'),
                   ' | Events: ', v_total_events,
                   ' | Revenue: $', FORMAT(v_total_revenue, 2),
                   ' | Active Clients: ', v_active_clients),
            NOW());
END$$

DELIMITER ;

-- ==========================================
-- EVENT 7: Daily Backup Reminder Log
-- Runs: Daily at 1:00 AM
-- Purpose: Creates daily snapshot for backup reference
-- ==========================================

DROP EVENT IF EXISTS evt_daily_backup_reminder;

DELIMITER $$

CREATE EVENT evt_daily_backup_reminder
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 HOUR
DO
BEGIN
    DECLARE v_total_events INT;
    DECLARE v_total_payments DECIMAL(10,2);
    
    SELECT COUNT(*) INTO v_total_events FROM events;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_payments 
    FROM payments WHERE status = 'completed';
    
    INSERT INTO activity_logs (user_id, action_type, table_name, new_value, created_at)
    VALUES (1, 'backup_reminder', 'system',
            CONCAT('Daily DB Stats - Events: ', v_total_events, 
                   ' | Total Revenue: $', FORMAT(v_total_payments, 2)),
            NOW());
END$$

DELIMITER ;

-- ==========================================
-- MANAGEMENT & MONITORING COMMANDS
-- ==========================================

/*
-- Check if event scheduler is running:
SHOW VARIABLES LIKE 'event_scheduler';

-- View all scheduled events:
SHOW EVENTS;

-- View specific event details:
SHOW CREATE EVENT evt_auto_complete_past_events;

-- Disable a specific event:
ALTER EVENT evt_auto_complete_past_events DISABLE;

-- Enable a specific event:
ALTER EVENT evt_auto_complete_past_events ENABLE;

-- Drop an event:
DROP EVENT IF EXISTS evt_auto_complete_past_events;

-- Turn off event scheduler:
SET GLOBAL event_scheduler = OFF;

-- Check event execution history:
SELECT * FROM activity_logs 
WHERE action_type IN ('auto_complete_events', 'reminder_generation', 
                      'auto_cancel_inquiry', 'log_cleanup', 
                      'payment_followup_flag', 'monthly_stats', 'backup_reminder')
ORDER BY created_at DESC
LIMIT 50;
*/

-- ==========================================
-- SUMMARY OF ALL EVENTS
-- ==========================================

/*
┌─────┬──────────────────────────────────┬────────────────┬─────────────────────────────────┐
│ #   │ Event Name                       │ Schedule       │ Purpose                         │
├─────┼──────────────────────────────────┼────────────────┼─────────────────────────────────┤
│ 1   │ evt_auto_complete_past_events    │ Daily 2:00 AM  │ Mark past events as completed   │
│ 2   │ evt_daily_reminder_generation    │ Daily 9:00 AM  │ Generate client reminders       │
│ 3   │ evt_auto_cancel_old_inquiries    │ Daily 3:00 AM  │ Cancel unpaid old inquiries     │
│ 4   │ evt_cleanup_old_logs             │ Monthly 4:00AM │ Clean logs >6 months old        │
│ 5   │ evt_weekly_payment_followup      │ Mon 10:00 AM   │ Flag overdue payments           │
│ 6   │ evt_monthly_stats_generation     │ Monthly 1:00AM │ Generate business stats         │
│ 7   │ evt_daily_backup_reminder        │ Daily 1:00 AM  │ Create daily snapshot log       │
└─────┴──────────────────────────────────┴────────────────┴─────────────────────────────────┘

All events are enabled by default after creation.
They will run automatically according to their schedules.
Monitor execution via activity_logs table.
*/
