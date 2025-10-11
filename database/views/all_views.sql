-- ==========================================
-- Database Views for Rosewood Event System
-- ==========================================

-- 1. Event Summary View
CREATE OR REPLACE VIEW v_event_summary AS
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
    et.base_price as base_price,
    u.user_id as client_id,
    u.full_name as client_name,
    u.email as client_email,
    u.phone as client_phone,
    COUNT(DISTINCT es.service_id) as service_count,
    COALESCE(SUM(es.quantity * es.agreed_price), 0) as total_service_cost,
    COALESCE(SUM(p.amount), 0) as total_paid,
    (COALESCE(SUM(es.quantity * es.agreed_price), 0) - COALESCE(SUM(p.amount), 0)) as balance,
    DATEDIFF(e.event_date, CURDATE()) as days_until_event,
    e.created_at,
    e.updated_at
FROM events e
JOIN event_types et ON e.event_type_id = et.event_type_id
JOIN users u ON e.client_id = u.user_id
LEFT JOIN event_services es ON e.event_id = es.event_id AND es.status != 'cancelled'
LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
GROUP BY e.event_id;

-- 2. Active Events View
CREATE OR REPLACE VIEW v_active_events AS
SELECT *
FROM v_event_summary
WHERE status IN ('inquiry', 'confirmed', 'in_progress')
ORDER BY event_date ASC;

-- 3. Upcoming Events View (Next 30 Days)
CREATE OR REPLACE VIEW v_upcoming_events AS
SELECT *
FROM v_event_summary
WHERE event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND status IN ('confirmed', 'in_progress')
ORDER BY event_date ASC;

-- 4. Service Usage Statistics
CREATE OR REPLACE VIEW v_service_stats AS
SELECT 
    s.service_id,
    s.service_name,
    s.category,
    s.unit_price,
    s.unit_type,
    COUNT(es.event_service_id) as times_booked,
    COALESCE(SUM(es.quantity), 0) as total_quantity,
    COALESCE(SUM(es.quantity * es.agreed_price), 0) as total_revenue,
    COALESCE(AVG(es.agreed_price), 0) as avg_price,
    s.is_available
FROM services s
LEFT JOIN event_services es ON s.service_id = es.service_id AND es.status != 'cancelled'
GROUP BY s.service_id;

-- 5. Payment Summary by Event
CREATE OR REPLACE VIEW v_payment_summary AS
SELECT 
    e.event_id,
    e.event_name,
    e.budget,
    COUNT(p.payment_id) as payment_count,
    COALESCE(SUM(CASE WHEN p.payment_type = 'advance' THEN p.amount ELSE 0 END), 0) as advance_paid,
    COALESCE(SUM(CASE WHEN p.payment_type = 'partial' THEN p.amount ELSE 0 END), 0) as partial_paid,
    COALESCE(SUM(CASE WHEN p.payment_type = 'final' THEN p.amount ELSE 0 END), 0) as final_paid,
    COALESCE(SUM(p.amount), 0) as total_paid,
    (e.budget - COALESCE(SUM(p.amount), 0)) as remaining
FROM events e
LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
GROUP BY e.event_id;

-- 6. User Activity Summary
CREATE OR REPLACE VIEW v_user_activity AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.role,
    u.status,
    COUNT(DISTINCT CASE WHEN u.role = 'client' THEN e.event_id END) as events_created,
    COUNT(al.log_id) as total_activities,
    MAX(al.created_at) as last_activity,
    u.created_at as member_since
FROM users u
LEFT JOIN events e ON u.user_id = e.client_id AND u.role = 'client'
LEFT JOIN activity_logs al ON u.user_id = al.user_id
GROUP BY u.user_id;

-- 7. Monthly Revenue View
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT 
    DATE_FORMAT(p.payment_date, '%Y-%m') as month,
    COUNT(DISTINCT p.event_id) as events_paid,
    COUNT(p.payment_id) as total_transactions,
    SUM(p.amount) as total_revenue,
    AVG(p.amount) as avg_payment
FROM payments p
WHERE p.status = 'completed'
GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
ORDER BY month DESC;
