-- ==========================================
-- ALL VIEWS - Rosewood Event System
-- Contains: 7 Basic + 3 Best Advanced Views
-- Manual Execution: Open in MySQL Workbench and execute
-- ==========================================

USE rosewood_events;

-- ==========================================
-- BASIC VIEWS (7)
-- ==========================================

-- 1. Event Summary (Main event overview)
DROP VIEW IF EXISTS v_event_summary;

CREATE VIEW v_event_summary AS
SELECT 
    e.event_id,
    e.event_name,
    e.event_date,
    e.event_time,
    e.venue,
    e.guest_count,
    e.budget,
    e.status,
    et.type_name as event_type,
    u.full_name as client_name,
    u.email as client_email,
    u.phone as client_phone,
    COALESCE(SUM(es.quantity * es.agreed_price), 0) as total_cost,
    COALESCE((SELECT SUM(amount) FROM payments p 
              WHERE p.event_id = e.event_id AND p.status = 'completed'), 0) as total_paid,
    COALESCE(SUM(es.quantity * es.agreed_price), 0) - 
    COALESCE((SELECT SUM(amount) FROM payments p 
              WHERE p.event_id = e.event_id AND p.status = 'completed'), 0) as balance
FROM events e
JOIN event_types et ON e.event_type_id = et.event_type_id
JOIN users u ON e.client_id = u.user_id
LEFT JOIN event_services es ON e.event_id = es.event_id AND es.status != 'cancelled'
GROUP BY e.event_id;

-- 2. Active Events
DROP VIEW IF EXISTS v_active_events;

CREATE VIEW v_active_events AS
SELECT 
    e.event_id,
    e.event_name,
    e.event_date,
    e.event_time,
    e.venue,
    et.type_name,
    u.full_name as client_name,
    e.status
FROM events e
JOIN event_types et ON e.event_type_id = et.event_type_id
JOIN users u ON e.client_id = u.user_id
WHERE e.status IN ('inquiry', 'confirmed', 'in_progress')
AND e.event_date >= CURDATE()
ORDER BY e.event_date ASC;

-- 3. Upcoming Events (Next 30 days)
DROP VIEW IF EXISTS v_upcoming_events;

CREATE VIEW v_upcoming_events AS
SELECT 
    e.event_id,
    e.event_name,
    e.event_date,
    e.event_time,
    e.venue,
    e.guest_count,
    et.type_name,
    u.full_name as client_name,
    u.phone as client_phone,
    DATEDIFF(e.event_date, CURDATE()) as days_until
FROM events e
JOIN event_types et ON e.event_type_id = et.event_type_id
JOIN users u ON e.client_id = u.user_id
WHERE e.event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
AND e.status NOT IN ('cancelled', 'completed')
ORDER BY e.event_date ASC;

-- 4. Service Statistics
DROP VIEW IF EXISTS v_service_stats;

CREATE VIEW v_service_stats AS
SELECT 
    s.service_id,
    s.service_name,
    s.category,
    s.base_price,
    COUNT(es.event_service_id) as times_booked,
    SUM(es.quantity) as total_quantity_sold,
    AVG(es.agreed_price) as avg_agreed_price,
    SUM(es.quantity * es.agreed_price) as total_revenue
FROM services s
LEFT JOIN event_services es ON s.service_id = es.service_id 
    AND es.status != 'cancelled'
GROUP BY s.service_id
ORDER BY total_revenue DESC;

-- 5. Payment Summary
DROP VIEW IF EXISTS v_payment_summary;

CREATE VIEW v_payment_summary AS
SELECT 
    p.payment_id,
    p.event_id,
    e.event_name,
    u.full_name as client_name,
    p.amount,
    p.payment_method,
    p.payment_type,
    p.payment_date,
    p.reference_number,
    p.status
FROM payments p
JOIN events e ON p.event_id = e.event_id
JOIN users u ON e.client_id = u.user_id
ORDER BY p.payment_date DESC;

-- 6. User Activity Log
DROP VIEW IF EXISTS v_user_activity;

CREATE VIEW v_user_activity AS
SELECT 
    al.log_id,
    al.user_id,
    u.full_name as user_name,
    al.action_type,
    al.table_name,
    al.record_id,
    al.old_value,
    al.new_value,
    al.timestamp
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.user_id
ORDER BY al.timestamp DESC;

-- 7. Monthly Revenue
DROP VIEW IF EXISTS v_monthly_revenue;

CREATE VIEW v_monthly_revenue AS
SELECT 
    DATE_FORMAT(payment_date, '%Y-%m') as month,
    COUNT(DISTINCT event_id) as events_paid,
    COUNT(*) as total_transactions,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_transaction,
    SUM(CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END) as cash_revenue,
    SUM(CASE WHEN payment_method = 'card' THEN amount ELSE 0 END) as card_revenue,
    SUM(CASE WHEN payment_method = 'bank_transfer' THEN amount ELSE 0 END) as bank_revenue
FROM payments
WHERE status = 'completed'
GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
ORDER BY month DESC;

-- ==========================================
-- ADVANCED VIEWS (Best 3 for Rosewood)
-- ==========================================

-- 8. Service Profitability Analysis (Uses CTEs - ADBMS Feature)
DROP VIEW IF EXISTS v_service_profitability;

CREATE VIEW v_service_profitability AS
WITH service_costs AS (
    SELECT 
        s.service_id,
        s.service_name,
        s.base_price,
        s.base_price * 0.7 as estimated_cost,
        s.base_price * 0.3 as estimated_profit
    FROM services s
),
service_bookings AS (
    SELECT 
        es.service_id,
        COUNT(DISTINCT es.event_id) as bookings,
        SUM(es.quantity) as total_quantity,
        SUM(es.quantity * es.agreed_price) as actual_revenue,
        AVG(es.agreed_price) as avg_price
    FROM event_services es
    WHERE es.status != 'cancelled'
    GROUP BY es.service_id
)
SELECT 
    sc.service_id,
    sc.service_name,
    sc.base_price,
    COALESCE(sb.bookings, 0) as bookings,
    COALESCE(sb.total_quantity, 0) as quantity_sold,
    COALESCE(sb.actual_revenue, 0) as revenue,
    COALESCE(sb.avg_price, sc.base_price) as avg_selling_price,
    sc.estimated_cost,
    sc.estimated_profit,
    COALESCE(sb.actual_revenue, 0) - (sc.estimated_cost * COALESCE(sb.total_quantity, 0)) as estimated_total_profit,
    CASE 
        WHEN COALESCE(sb.actual_revenue, 0) = 0 THEN 0
        ELSE ROUND(((COALESCE(sb.actual_revenue, 0) - (sc.estimated_cost * COALESCE(sb.total_quantity, 0))) / 
                    COALESCE(sb.actual_revenue, 0)) * 100, 2)
    END as profit_margin_pct
FROM service_costs sc
LEFT JOIN service_bookings sb ON sc.service_id = sb.service_id
ORDER BY estimated_total_profit DESC;

-- 9. Revenue Trends (Uses Window Functions - ADBMS Feature)
DROP VIEW IF EXISTS v_revenue_trends;

CREATE VIEW v_revenue_trends AS
SELECT 
    DATE_FORMAT(p.payment_date, '%Y-%m') as month,
    SUM(p.amount) as monthly_revenue,
    COUNT(DISTINCT p.event_id) as events_count,
    AVG(p.amount) as avg_transaction,
    LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')) as prev_month_revenue,
    SUM(p.amount) - LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')) as revenue_change,
    ROUND(((SUM(p.amount) - LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m'))) / 
           NULLIF(LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')), 0)) * 100, 2) as growth_pct,
    SUM(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m') 
                             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_revenue
FROM payments p
WHERE p.status = 'completed'
GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
ORDER BY month DESC;

-- 10. Client Segments (Advanced customer analysis)
DROP VIEW IF EXISTS v_client_segments;

CREATE VIEW v_client_segments AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    COUNT(DISTINCT e.event_id) as total_events,
    SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_events,
    SUM(CASE WHEN e.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_events,
    COALESCE(SUM(p.amount), 0) as lifetime_value,
    COALESCE(AVG(p.amount), 0) as avg_payment,
    MAX(e.event_date) as last_event_date,
    DATEDIFF(CURDATE(), MAX(e.event_date)) as days_since_last_event,
    CASE 
        WHEN COALESCE(SUM(p.amount), 0) >= 100000 THEN 'VIP'
        WHEN COALESCE(SUM(p.amount), 0) >= 50000 THEN 'Premium'
        WHEN COALESCE(SUM(p.amount), 0) >= 20000 THEN 'Regular'
        WHEN COUNT(DISTINCT e.event_id) > 0 THEN 'New'
        ELSE 'Prospect'
    END as client_segment,
    CASE 
        WHEN MAX(e.event_date) IS NULL THEN 'Never Booked'
        WHEN DATEDIFF(CURDATE(), MAX(e.event_date)) <= 90 THEN 'Active'
        WHEN DATEDIFF(CURDATE(), MAX(e.event_date)) <= 365 THEN 'At Risk'
        ELSE 'Inactive'
    END as engagement_status
FROM users u
LEFT JOIN events e ON u.user_id = e.client_id
LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
WHERE u.role = 'client'
GROUP BY u.user_id
ORDER BY lifetime_value DESC;

-- ==========================================
-- TOTAL: 10 Views (7 Basic + 3 Advanced)
-- Web App Usage Examples:
--
-- 1. Get all active events:
--    SELECT * FROM v_active_events;
--
-- 2. Get upcoming events:
--    SELECT * FROM v_upcoming_events;
--
-- 3. View service profitability:
--    SELECT * FROM v_service_profitability WHERE bookings > 0;
--
-- 4. Monthly revenue trends:
--    SELECT * FROM v_revenue_trends LIMIT 12;
--
-- 5. Client segments:
--    SELECT * FROM v_client_segments WHERE client_segment IN ('VIP', 'Premium');
--
-- 6. Event summary for specific event:
--    SELECT * FROM v_event_summary WHERE event_id = 1;
--
-- Views are like pre-built queries - just SELECT from them!
-- ==========================================
